import * as Html from './Html'

export function groupListIssues(issues, parsedDocuments) {
  const listIssues = []
  const otherIssues = []
  
  issues.forEach(issue => {
    if (issue.scanRuleId === 'list_markup_review') {
      listIssues.push(issue)
    } else {
      otherIssues.push(issue)
    }
  })
  
  if (listIssues.length === 0) return issues
  
  const groupedLists = groupByProximity(listIssues, parsedDocuments, issues)
  const parentIssues = groupedLists.map(group => createParentIssue(group, parsedDocuments))
  
  return [...otherIssues, ...parentIssues]
}

function groupByProximity(listIssues, parsedDocuments, allIssues) {
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
          
          if (issuesForElement.length > 0) {
            listItems.push({
              issue: issuesForElement[0],
              element: sibling,
              listInfo,
              domIndex: index
            })
          }
        }
      })
      
      if (listItems.length === 0) return
      
      let currentGroup = []
      let lastListInfo = null
      
      listItems.forEach(({ issue, listInfo }) => {
        const shouldStartNewGroup = 
          !lastListInfo ||
          listInfo.type !== lastListInfo.type ||
          (listInfo.type === 'numbered' && listInfo.value === 1 && lastListInfo.value > 1) ||
          (listInfo.type === 'lettered' && listInfo.value === 1 && lastListInfo.value > 1) ||
          (listInfo.type === 'lettered' && listInfo.isUpperCase !== lastListInfo.isUpperCase)
        
        if (shouldStartNewGroup) {
          if (currentGroup.length > 0) {
            groups.push(currentGroup)
          }
          currentGroup = [issue]
        } else {
          currentGroup.push(issue)
        }
        
        lastListInfo = listInfo
      })
      
      if (currentGroup.length > 0) {
        groups.push(currentGroup)
      }
    })
  })
  
  return groups
}

function extractListInfo(text) {
  const numberedPattern = /^\s*(\d+)\s*[\.\)\-\:]\s*/
  const letteredPattern = /^\s*([a-zA-Z])\s*[\.\)\-\:]\s*/
  const bulletPattern = /^\s*[•\-\*○●■□▪▫]\s+/
  
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

function createParentIssue(issueGroup, parsedDocuments) {
  if (issueGroup.length === 1) return issueGroup[0]
  
  const firstIssue = issueGroup[0]
  const contentItemId = firstIssue.contentItemId
  let allItemsHtml = issueGroup.map(issue => issue.sourceHtml).join('\n')
  
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
  }
  
  let metadata = {}
  if (typeof firstIssue.metadata === 'string') {
    try { metadata = JSON.parse(firstIssue.metadata) } catch (e) { metadata = {} }
  } else {
    metadata = firstIssue.metadata || {}
  }
  
  metadata.listGroupCount = issueGroup.length
  metadata.listGroupIds = issueGroup.map(i => i.id)
  metadata.listGroupXpaths = issueGroup.map(i => i.xpath)
  metadata.isListGroup = true
  
  parentIssue.metadata = JSON.stringify(metadata)
  
  return parentIssue
}

// Clean the wrapper div from newHtml before saving
export function cleanListGroupWrapper(html) {
  if (!html) return html
  
  return html.replace(/<div data-udoit-list-group="true">\s*/gi, '')
             .replace(/\s*<\/div>\s*$/gi, '')
             .trim()
}