import * as Html from './Html'

/** With all of the data inconsistency between the old and new issues, we need to double-check some things:
 *    1. If the issue is ACTIVE (found in the scan) but should be ignored, either because of the old 
 *      "phpally-ignore" class or the new "udoit-ignore-rule-id" classes. These are no longer filtered out
 *      during the backend scan.
 *    2. If the issue is old, it will have code in the "html" field, but no xpath. If it is new, it will have an
 *      xpath but no source html code. The database is now storing these in 'issue' table as follows:
 *      - html: the xpath for the issue
 *      - preview_html: the source html for the issue
 *      - new_html: the edited source used when saving or marking the issue as resolved
 *    3. To avoid confusion, once we take data out of the database, we are formatting the issue object with more
 *      understandable fields: xpath, sourceHtml, and newHtml.
 **/

const checkTextBlockHeading = (issue, element) => {
  let issueIgnored = false
  
  // For the text_block_heading rule, we need to check if the element is inside a table cell.
  let parentElement = element.parentElement
  while(parentElement) {
    if(parentElement.tagName.toLowerCase() === 'th' || parentElement.tagName.toLowerCase() === 'td') {
      issueIgnored = true
    }
    else if(issueIgnored && parentElement.tagName.toLowerCase() === 'table') {
      // If the table is decorative, there may be a valid reason for heading elements inside it.
      let role = parentElement.getAttribute('role')
      let ariaHidden = parentElement.getAttribute('aria-hidden')
      if((role && role === 'presentation') || (ariaHidden && ariaHidden === 'true')) {
        issueIgnored = false
      }
    }
    parentElement = parentElement.parentElement
  }

  return issueIgnored
}

const checkStyleColorMisuse = (issue, element) => {

  let tagName = element.tagName.toLowerCase()
  if(tagName === 'img' || tagName === 'svg') {
    return true
  }
  
  return false
}

const runCustomChecks = (issue, element) => {
  if(issue.scanRuleId === 'style_color_misuse') {
    return checkStyleColorMisuse(issue, element)
  }
  else if(issue.scanRuleId === 'text_block_heading') {
    return checkTextBlockHeading(issue, element)
  }
  return false
}

/********************************************************************************************
  * TODO: Find a more consistent way to map modules that works with less bespoke data.
  * In Canvas, the modules and moduleItems have names and links, but do not have the
  * contentItemId, which is necessary to match the issue to the content. The only current
  * data that matches are the moduleItem's page_url are the contentItem's lmsContentId,
  * which are both the same internal link URL.
  *
  * Canvas Content Item Data:
  *   contentType: "page"
  *   id: 61
  *   lmsContentId: "4-dot-1-2-name-role-value-input-fields"
  *   status: true
  *   title: "4.1.2 Name, Role, Value - Input Fields"
  *   updated: "2025-01-13T13:46:05+00:00"
  *   url: "https://canvas.dev.cdl.ucf.edu/courses/383/pages/4-dot-1-2-name-role-value-input-fields"
  *
  * Canvas Section Item Data:
  *   html_url: "https://canvas.dev.cdl.ucf.edu/courses/383/modules/items/3896"
  *   id: 3896
  *   indent: 0
  *   module_id: 562
  *   page_url: "4-dot-1-2-name-role-value-input-fields"
  *   position: 1
  *   published: true
  *   quiz_lti: false
  *   title: "4.1.2 Name, Role, Value - Input Fields"
  *   type: "Page"
  *   url: "https://canvas.dev.cdl.ucf.edu/api/v1/courses/383/pages/4-dot-1-2-name-role-value-input-fields"
  *
  *******************************************************************************************/
  
const getSectionsFromContentItem = (contentSections, contentItem) => {
  if(!contentSections || contentSections.length === 0) {
    return []
  }

  let itemSections = []
  contentSections.forEach((section) => {
    let tempSectionId = section.id
    section.items.forEach((item) => {
      if(item.page_url && item.page_url === contentItem.lmsContentId) {
        itemSections.push(tempSectionId.toString())
      }
    })
  })
  return itemSections
}

const getSectionsFromFile = (contentSections, fileData) => {
  if(!contentSections || contentSections.length === 0) {
    return []
  }

  let fileSections = []
  contentSections.forEach((section) => {
    let tempSectionId = section.id
    section.items.forEach((item) => {
      if(item.type === 'File' && item.content_id && item.content_id.toString() === fileData.lmsFileId.toString()) {
        fileSections.push({
          moduleId: tempSectionId,
          itemPosition: item.position,
          contentItemTitle: section.title,
          contentItemUrl: section.url,
          contentType: 'section',
          indent: item.indent,
          itemId: item.id
        })
      }
    })
  })
  return fileSections
}

const getReferenceFromSection = (contentSections, sectionId) => {
  if(!contentSections || contentSections.length === 0) {
    return null
  }

  let sectionReference = null
  contentSections.forEach((section) => {
    if(section.id.toString() === sectionId.toString()) {
      sectionReference = {
        contentItemId: section.id,
        contentItemTitle: section.title,
        contentItemUrl: section.url || '',
        contentType: 'section',
      }
    }
  })
  return sectionReference
}

export function analyzeReport(report, ISSUE_STATE) {
  let tempReport = {
    contentFixed: report.contentFixed || 0,
    contentResolved: report.contentResolved || 0,
    contentHandled: (report.contentFixed || 0) + (report.contentResolved || 0),
    contentSections: [...report.contentSections],
    created: report.created || 0,
    files: {...report.files},
    filesReviewed: report.filesReviewed || 0,
    id: report.id || 0,
    itemsScanned: report.itemsScanned || 0,
    ready: report.ready || false,
  }

  let usedContentItems = {}
  let parsedDocuments = {}
  let activeIssues = []
  let scanCounts = {
    errors: 0,
    potentials: 0,
    suggestions: 0,
    files: 0,
  }
  let scanRules = {}
  let sessionIssues = {}
  let sessionFiles = {}
  let currentTime = new Date()
  let millisecondsInADay = 86400000 // 1000 * 60 * 60 * 24

  const parser = new DOMParser()
  const fileReferences = {}

  // Parse every document only once. Not every content item will have issues, but we need to parse each one anyway
  // so we can scan them for references to course files.
  Object.values(report.contentItems).forEach((contentItem) => {
    contentItem.sections = getSectionsFromContentItem(report.contentSections, contentItem)
    if(contentItem.body) {
      let tempBody = parser.parseFromString(contentItem.body, 'text/html')
 
      // Get all of the links to files in the content item.
      let links = tempBody.getElementsByTagName('a')
      const fileUrlPattern = /\/files\/(\d+)/
      for(let i = 0; i < links.length; i++) {
        let link = links[i]
        let href = link.getAttribute('href')
        if(href) {
          let match = href.match(fileUrlPattern)
          if(match && match[1]) {
            let fileId = match[1]
            if(!fileReferences[fileId]) {
              fileReferences[fileId] = []
            }
            fileReferences[fileId].push({
              contentItemId: contentItem.id,
              contentItemBody: contentItem.body,
              contentItemTitle: contentItem.title,
              contentItemUrl: contentItem.url,
              contentItemLmsId: contentItem.lmsContentId,
              contentType: contentItem.contentType,
            })
          }
        }
      }

      parsedDocuments[contentItem.id] = tempBody
      usedContentItems[contentItem.id] = contentItem
    }
  })

  report.issues.forEach((issue) => {

    // By default, we assume the issue is included in the final report.
    let issueIgnored = false

    // If the issue is "unresolved" (0), we need to see if it exists in the relevant content item
    // and if it has the "phpally-ignore" or "udoit-ignore-rule-id" class. If so, we ignore it.
    if(issue.status === 0) {

      // Get the relevant content item
      let contentItemId = issue.contentItemId
      
      if(parsedDocuments[contentItemId]) {
        // In the initial scan, whatever comes back is saved to both the issue.xpath and issue.sourceHtml variables.
        let element = Html.findElementWithIssue(parsedDocuments[contentItemId], issue)
        if(element) {
          issue.sourceHtml = Html.toString(element)
          let elementClasses = element.getAttribute('class')
          if(elementClasses) {
            let specificError = 'udoit-ignore-' + issue.scanRuleId.replaceAll("_", "-")
            let classesArray = elementClasses.split(' ')
            if(classesArray.includes('phpally-ignore') || classesArray.includes(specificError)) {
              issueIgnored = true
            }
          }
          
          // For the text_block_heading rule, we need to check if the element is inside a table cell.
          if(runCustomChecks(issue, element)) {
            issueIgnored = true
          }
        }
        else {
          issueIgnored = true
        }
      }
    }
    else {
      if(issue.fixedOn) {
        let fixedOnTime = new Date(issue.fixedOn)
        if(currentTime - fixedOnTime < millisecondsInADay) {
          sessionIssues[issue.id] = (issue.status === 1) ? ISSUE_STATE.SAVED : ISSUE_STATE.RESOLVED
        }
      }
    }

    if(!issueIgnored) {
      activeIssues.push(issue)

      if(issue.type === 'error') {
        scanCounts.errors += 1
      }
      else if(issue.type === 'potential') {
        scanCounts.potentials += 1
      }
      else if(issue.type === 'suggestion') {
        scanCounts.suggestions += 1
      }

      if(!usedContentItems[issue.contentItemId] && report.contentItems[issue.contentItemId]) {
        usedContentItems[issue.contentItemId] = report.contentItems[issue.contentItemId]
      }

      if(!(issue.scanRuleId in scanRules)) {
        scanRules[issue.scanRuleId] = 1
      }
      else {
        scanRules[issue.scanRuleId] += 1
      }
    }
  })

  // We're double-dipping here.
  // Each file should have a list of sections it appears in for filtering, and that means that
  // each reference to a file should add its parent section to the list.
  // We ALSO want a list of references to include the section(s) the file appears in outside of
  // references (like when the file is linked in the modules directly).
  const lmsIdToFileMap = {}
  report.files.forEach((file) => {
    file.references = fileReferences[parseInt(file.lmsFileId)] || []
    const sectionRefs =  getSectionsFromFile(report.contentSections, file)
    file.sectionRefs = sectionRefs ? sectionRefs : []
  })

  let tempFilesReviewed = 0
  Object.values(report.files).forEach((file) => {
    if(file.reviewed) {
      tempFilesReviewed += 1
    }
    else {
      scanCounts.files += 1
    }

    lmsIdToFileMap[file.lmsFileId] = file
  })

  report.files.forEach((file) => {
    if(lmsIdToFileMap[file.metadata.replacementFileId]){
       file.replacement = lmsIdToFileMap[file.metadata.replacementFileId]
       let tempFile = file.replacement
       while(tempFile.replacement){
        tempFile = tempFile.replacement
       }
       file.replacement = tempFile
    }
    if(file.reviewed){
      const fixedOn = new Date(file.updated)
      if(currentTime - fixedOn < millisecondsInADay){
        sessionFiles[file.id] = file.replacement ? ISSUE_STATE.SAVED : ISSUE_STATE.RESOLVED
      }
    }
  })
  
  tempReport.issues = activeIssues
  tempReport.scanCounts = scanCounts
  tempReport.scanRules = scanRules
  tempReport.files = {...report.files}
  tempReport.contentItems = usedContentItems
  tempReport.sessionIssues = sessionIssues
  tempReport.sessionFiles = sessionFiles
  tempReport.filesReviewed = tempFilesReviewed

  console.log(tempReport)
  console.log(lmsIdToFileMap)
  return tempReport
}