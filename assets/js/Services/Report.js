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

const checkTextContrastSufficient = (issue, element, parsedDocument) => {
  if (!element || !parsedDocument) {
    return false;
  }

  // Helper to get inline style for an element
  function getInlineStyle(el, property) {
    if (!el || !el.hasAttribute('style')) return '';
    const styleAttr = el.getAttribute('style');
    const regex = new RegExp(`${property}\\s*:\\s*([^;]+)`, 'i');
    const match = styleAttr.match(regex);
    return match ? match[1].trim() : '';
  }

  // Helper to walk up and find the first ancestor with a non-transparent background
  function findBgAncestor(el) {
    let current = el;
    while (current && current.nodeType === 1) {
      const bgColor = getInlineStyle(current, 'background-color');
      const bgImage = getInlineStyle(current, 'background-image') || getInlineStyle(current, 'background');
      if (
        (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0,0,0,0)') ||
        (bgImage && bgImage !== 'none')
      ) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  // Helper to walk up and find the first ancestor with a non-inherited text color
  function findTextAncestor(el) {
    let current = el;
    while (current && current.nodeType === 1) {
      const color = getInlineStyle(current, 'color');
      if (color && color !== 'inherit') {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  // Find ancestors
  const bgAncestor = findBgAncestor(element);
  const textAncestor = findTextAncestor(element);

  // Set the issue's xpath and sourceHtml to the background color element
  if (bgAncestor) {
    issue.xpath = Html.findXpathFromElement(bgAncestor);
    issue.sourceHtml = Html.toString(bgAncestor); // <-- Set sourceHtml to the correct scope
  }

  // Store the text color element's xpath in metadata
  if (textAncestor && bgAncestor) {
    // Compute relative xpath from bgAncestor to textAncestor
    function getRelativeXpath(from, to) {
      let path = [];
      let current = to;
      while (current && current !== from) {
        let tagName = current.tagName.toLowerCase();
        let siblings = Array.from(current.parentNode.children).filter(
          sibling => sibling.tagName.toLowerCase() === tagName
        );
        let index = siblings.indexOf(current) + 1;
        path.unshift(`${tagName}[${index}]`);
        current = current.parentNode;
      }
      return path.length ? path.join('/') : '';
    }
    // Parse metadata if it's a string
    if (typeof issue.metadata === 'string') {
      try {
        issue.metadata = JSON.parse(issue.metadata);
      } catch (e) {
        issue.metadata = {};
      }
    }
    issue.metadata = issue.metadata || {};
    issue.metadata.textColorXpath = getRelativeXpath(bgAncestor, textAncestor);
    issue.metadata.focusXpath = Html.findXpathFromElement(element);
    issue.metadata = JSON.stringify(issue.metadata);
  }
  // Return false to indicate this issue should not be ignored
  return false;
}

const checkImgAltBackground = (issue, element) => {
  if (!(element instanceof HTMLElement)) return false;

  // Read inline style safely
  const styleAttr = element.getAttribute('style') || '';
  if (!styleAttr) return false;

  // Normalize: lowercase, collapse spaces, strip trailing semicolons, set regex
  const style = styleAttr.toLowerCase().replace(/\s+/g, ' ').trim();
  const gradientRegex = /background(?:-image)?\s*:\s*[^;]*(linear|radial|conic|repeating-(?:linear|radial))-gradient\s*\(/;

  // Return true if any gradient type is found
  return gradientRegex.test(style);
};

const runCustomChecks = (issue, element, parsedDocument) => {
  if(issue.scanRuleId === 'style_color_misuse') {
    return checkStyleColorMisuse(issue, element)
  }
  else if(issue.scanRuleId === 'text_block_heading') {
    return checkTextBlockHeading(issue, element)
  }
  else if(issue.scanRuleId === 'text_contrast_sufficient') {
    return checkTextContrastSufficient(issue, element, parsedDocument)
  }
  else if(issue.scanRuleId === 'img_alt_background') {
    return checkImgAltBackground(issue, element)
  }
  return false
} 

export function analyzeReport(report, ISSUE_STATE) {
  let tempReport = {
    contentFixed: report.contentFixed || 0,
    contentResolved: report.contentResolved || 0,
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
    suggestions: 0
  }
  let sessionIssues = {}
  let currentTime = new Date()
  let millisecondsInADay = 86400000 // 1000 * 60 * 60 * 24

  const parser = new DOMParser()

  report.issues.forEach((issue) => {

    // By default, we assume the issue is included in the final report.
    let issueIgnored = false

    // If the issue is "unresolved" (0), we need to see if it exists in the relevant content item
    // and if it has the "phpally-ignore" or "udoit-ignore-rule-id" class. If so, we ignore it.
    if(issue.status === 0) {

      // Get the relevant content item
      let contentItemId = issue.contentItemId
      
      // We're quickly caching all of the parsed documents so we don't have to parse them for each issue.
      let parsedDocument = null
      if(parsedDocuments[contentItemId]) {
        parsedDocument = parsedDocuments[contentItemId]
      }
      else {
        if(report?.contentItems[contentItemId]?.body) {
          parsedDocuments[contentItemId] = parser.parseFromString(report.contentItems[contentItemId].body, 'text/html')
          parsedDocument = parsedDocuments[contentItemId]
        }
      }
      
      if(parsedDocument) {
        // In the initial scan, whatever comes back is saved to both the issue.xpath and issue.sourceHtml variables.
        let element = Html.findElementWithIssue(parsedDocument, issue)
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
          if(runCustomChecks(issue, element, parsedDocument)) {
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
    }
  })

  scanCounts.potentials += Object.keys(tempReport.files).length
  scanCounts.potentials -= tempReport.filesReviewed

  tempReport.issues = activeIssues
  tempReport.scanCounts = scanCounts
  tempReport.contentItems = usedContentItems
  tempReport.sessionIssues = sessionIssues

  return tempReport
}