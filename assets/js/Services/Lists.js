import * as Html from './Html'

// regexes
// Match IBM Equal Access scanner pattern:
// /^[ \t\r\n]*[( ]*[1-9]*[\*\-).][ \t][A-Z,a-z]+/
export const numberedPattern = /^\s*[(\s]*([1-9]\d*)\s*[.\)\-]\s+/
export const letteredPattern = /^\s*[(\s]*([a-zA-Z])\s*[.\)\-]\s+/ // IBM doesn't actually catch letter lists right now ;(
export const bulletPattern = /^\s*([\*\-])\s+/  // Only * and -, requires space after

export function groupListIssues(issues, parsedDocuments) {
  const listIssues = []
  const otherIssues = []
  
  issues.forEach(issue => {
    if (issue.scanRuleId === 'list_markup_review') {
      // If the issue has been fixed or reviewed it MAY be a single, non-grouped item.
      const tempElement = Html.toElement(Html.getIssueHtml(issue))
      const listTags = ['OL', 'UL', 'DL']
      if(tempElement && tempElement?.nodeType === Node.ELEMENT_NODE && listTags.includes(Html.getTagName(tempElement))) {
        otherIssues.push(issue)
      }
      else {
        listIssues.push(issue)
      }
    } else {
      otherIssues.push(issue)
    }
  })
  
  if (listIssues.length === 0) return issues
  
  const groupedLists = groupByProximity(listIssues, parsedDocuments, issues)
  const parentIssues = groupedLists.map(group => createParentIssue(group, parsedDocuments))
  
  return [...otherIssues, ...parentIssues]
}

function groupByProximity(listIssues, parsedDocuments) {
  const issuesByContent = {}
  listIssues.forEach(issue => {
    if (!issuesByContent[issue.contentItemId]) issuesByContent[issue.contentItemId] = []
    issuesByContent[issue.contentItemId].push(issue)
  })
  
  const groups = []
  
  Object.keys(issuesByContent).forEach(contentItemId => {
    const contentIssues = issuesByContent[contentItemId]
    const parsedDoc = parsedDocuments[contentItemId]
    
    if (!parsedDoc) {
      contentIssues.forEach(issue => groups.push([issue]))
      return
    }

    const parentMap = new Map()
    
    contentIssues.forEach(issue => {
      const element = Html.findElementWithIssue(parsedDoc, issue)
      if (!element) return
      
      let topElement = element
      while (topElement.parentElement && topElement.parentElement.tagName !== 'BODY') {
        const parentTag = topElement.parentElement.tagName.toLowerCase()
        if (['p', 'div', 'li'].includes(parentTag)) {
          topElement = topElement.parentElement
          break
        }
        topElement = topElement.parentElement
      }
      
      const parent = topElement.parentElement
      if (!parentMap.has(parent)) {
        parentMap.set(parent, new Map())
      }
      
      if (!parentMap.get(parent).has(topElement)) {
        parentMap.get(parent).set(topElement, [])
      }
      parentMap.get(parent).get(topElement).push(issue)
    })

    parentMap.forEach((elementIssueMap, parent) => {
      const siblings = Array.from(parent.children)
      const listItems = []
      
      siblings.forEach((sibling, index) => {
        const text = sibling.textContent.trim()
        const listInfo = extractListInfo(text)
        
        if (listInfo) {
          const issuesForElement = elementIssueMap.get(sibling) || []
          
          listItems.push({
            issue: issuesForElement.length > 0 ? issuesForElement[0] : null,
            element: sibling,
            listInfo,
            domIndex: index
          })
        }
      })
      
      if (listItems.length === 0) return
      
      let currentGroup = []
      let currentGroupElements = []
      let lastListInfo = null
      let lastDomIndex = -1
      
      listItems.forEach(({ issue, element, listInfo, domIndex }) => {
        const shouldStartNewGroup = 
          !lastListInfo ||
          listInfo.type !== lastListInfo.type ||
          domIndex !== lastDomIndex + 1 ||
          (listInfo.type === 'numbered' && listInfo.value === 1 && lastListInfo.value > 1) ||
          (listInfo.type === 'lettered' && listInfo.value === 1 && lastListInfo.value > 1) ||
          (listInfo.type === 'lettered' && listInfo.isUpperCase !== lastListInfo.isUpperCase)
        
        if (shouldStartNewGroup) {
          if (currentGroup.length > 0) {
            groups.push({ issues: currentGroup, elements: [...currentGroupElements] })
          }
          currentGroup = issue ? [issue] : []
          currentGroupElements = [element]
        } else {
          if (issue) {
            currentGroup.push(issue)
          }
          currentGroupElements.push(element)
        }
        
        lastListInfo = listInfo
        lastDomIndex = domIndex
      })

      if (currentGroup.length > 0) {
        groups.push({ issues: currentGroup, elements: [...currentGroupElements] })
      }
    })
  })
  
  return groups
}

function extractListInfo(text) {
  let match = text.match(numberedPattern)
  if (match) return { type: 'numbered', value: parseInt(match[1]), prefix: match[0] }
  
  match = text.match(letteredPattern)
  if (match) {
    const letter = match[1]
    const value = letter.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 1
    return { type: 'lettered', value, isUpperCase: letter === letter.toUpperCase(), prefix: match[0] }
  }
  
  match = text.match(bulletPattern)
  if (match) return { type: 'bullet', prefix: match[0] }
  
  return null
}

function createParentIssue(group) {
  const issueGroup = group.issues
  const elements = group.elements
  
  if (issueGroup.length === 1) return issueGroup[0]
  
  const firstIssue = issueGroup[0]
  const contentItemId = firstIssue.contentItemId
  let allItemsHtml = elements.map(el => el.outerHTML).join('\n')
  
  const parentIssue = {
    ...firstIssue,
    id: `list_group_${contentItemId}_${firstIssue.id}`,
    xpath: firstIssue.xpath,
    sourceHtml: allItemsHtml,
    initialHtml: allItemsHtml,
    newHtml: null,
    isGrouped: true,
    groupedIssues: issueGroup,
    groupCount: issueGroup.length,
    groupedIssueIds: issueGroup.map(i => i.id),
    // Store each element's HTML individually for removal later
    groupedElementsHtml: elements.map(el => el.outerHTML),
  }
  
  let metadata = {}
  if (typeof firstIssue.metadata === 'string') {
    try { metadata = JSON.parse(firstIssue.metadata) } catch (e) { metadata = {} }
  } else {
    metadata = firstIssue.metadata || {}
  }
  
  metadata.listGroupCount = issueGroup.length
  metadata.listGroupIds = issueGroup.map(i => i.id)
  metadata.listGroupXpaths = elements.map(el => Html.findXpathFromElement(el))
  metadata.isListGroup = true
  
  parentIssue.metadata = JSON.stringify(metadata)
  
  return parentIssue
}

export function cleanListGroupWrapper(html) {
  if (!html) return html
  
  return html.replace(/<div data-udoit-list-group="true">\s*/gi, '')
             .replace(/\s*<\/div>\s*$/gi, '')
             .trim()
}