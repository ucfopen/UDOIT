// When JavaScript's DOMParser encounters certain elements, it WILL NOT parse them unless they are wrapped
// in the required parent element. This function wraps the error HTML in the required parent element so that
// the DOMParser can parse it correctly.
export function toElement(htmlString) {
  if ('string' !== typeof htmlString) {
    return htmlString
  }

  let tagName = htmlString.match(/^<(\w+)/)?.[1].toLowerCase()

  const SPECIAL_CASES = {
    thead: "<table>{content}</table>",
    tbody: "<table>{content}</table>",
    tfoot: "<table>{content}</table>",
    caption: "<table>{content}</table>",
    tr: "<table><tbody>{content}</tbody></table>",
    td: "<table><tbody><tr>{content}</tr></tbody></table>",
    th: "<table><tbody><tr>{content}</tr></tbody></table>",
    colgroup: "<table>{content}</table>",
    col: "<table><colgroup>{content}</colgroup></table>",
    option: "<select>{content}</select>",
    optgroup: "<select>{content}</select>",
    legend: "<fieldset>{content}</fieldset>",
    dt: "<dl>{content}</dl>",
    dd: "<dl>{content}</dl>",
    li: "<ul>{content}</ul>",
    area: "<map>{content}</map>",
    param: "<object>{content}</object>",
    source: "<video>{content}</video>",
    track: "<video>{content}</video>"
  }

  // Wrap special elements inside their required parent(s) if they are in the SPECIAL_CASES object
  let wrappedHTML = SPECIAL_CASES[tagName] ? SPECIAL_CASES[tagName].replace('{content}', htmlString) : htmlString

  // Parse the wrapped HTML
  const parser = new DOMParser()
  const tempDoc = parser.parseFromString(wrappedHTML, "text/html")

  // Extract the real element from the correct position
  if (SPECIAL_CASES[tagName]) {
      return tempDoc.querySelector(tagName)
  } else {
      return tempDoc.body.firstElementChild
  }
}

export function toString(element) {
  if (!element) {
    return ''
  }
  return element.outerHTML
}

export function getInnerText(element) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return ''
  }

  // TODO: add logic that looks for multiple text nodes, factors in children elements, etc
  return element.innerText
}

export function setInnerText(element, newText) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  const children = element.childNodes
  let textNodeFound = false

  children.forEach(node => {
    if(node.nodeType === Node.TEXT_NODE) {
      if(textNodeFound != true) {
        node.nodeValue = newText
        textNodeFound = true
      } else {
        // TODO: add support for multiple text nodes
        node.nodeValue = ''
      }

    }
  })

  if (!textNodeFound) {
    const textNode = document.createTextNode(newText)
    element.appendChild(textNode)
  }

  return element
}

export function getAttribute(element, name) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return null
  }

  return element.getAttribute(name)
}

export function setAttribute(element, name, value) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return null
  }

  element.setAttribute(name, value)

  return element
}

export function removeAttribute(element, name) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return null
  }

  element.removeAttribute(name)

  return element
}

export function getClasses(element) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return []
  }

  let classes = element.getAttribute('class')

  return (classes) ? classes.split(' ') : []
}

export function addClass(element, className) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return null
  }

  let classes = getClasses(element)
  classes.push(className)
  let uniqueClasses = [...new Set(classes)]

  element.setAttribute('class', uniqueClasses.join(' '))

  return element;
}

export function removeClass(element, className) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return null
  }

  let classes = getClasses(element)
  classes = classes.filter(item => item !== className)

  element.setAttribute('class', classes.join(' '))

  return element;
}

export function getTagName(element) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return null
  }

  return element.tagName
}

export function removeTag(element, tagName) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return null
  }

  tagName = tagName.toLowerCase();

  for (let replaceTag of [`<${tagName}>`, `<${tagName}[^>]*>`, `</${tagName}>`]) {
    element.innerHTML = element.innerHTML.replace(replaceTag, "")
  }

  return element
}

export function hasTag(element, tagName) {
  let found = false

  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return false
  }

  const startTags = [`<${tagName.toLowerCase()}>`, `<${tagName.toLowerCase()} `]
  const endTag = `</${tagName.toLowerCase()}>`

  for (let startTag of startTags) {
    if (element.innerHTML.toLowerCase().includes(startTag) && (element.innerHTML.toLowerCase().includes(endTag))) {
      found = true
    }
  }

  return found
}


export function renameElement(element, newName) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return null
  }

  let newElement = document.createElement(newName)

  // Copy children
  while (element.firstChild) {
    newElement.appendChild(element.firstChild)
  }

  // Copy the attributes
  for (const attr of element.attributes) {
    newElement.attributes.setNamedItem(attr.cloneNode())
  }

  return newElement
}

export function prepareLink(element) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return null
  }

  if (element.nodeName === 'A') {
    element = setAttribute(element, "target", "_blank")
  }

  let children = Array.from(element.childNodes)

  children.forEach(child => {
    if (child.nodeName === 'A') {
      child = setAttribute(child, "target", "_blank")
    }
  })

  return element;
}

export function processStaticHtml(nodes, settings) {    
  let baseUrl = document.referrer.endsWith('/') ? document.referrer.slice(0, -1) : document.referrer

  if (settings) {
    baseUrl = `https://${settings.institution.lmsDomain}`
  }

  for (let node of nodes) {
    if (('tag' === node.type) && ('a' === node.name)) {
      node.attribs.target = '_blank'
    }
    if (('tag' === node.type) && ('img' === node.name)) {
      if (node.attribs.src && node.attribs.src.startsWith('/')) {
        node.attribs.src = `${baseUrl}${node.attribs.src}`
      }
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children = processStaticHtml(node.children)
    }
  }

  return nodes    
}

export function getIssueHtml(issue) {
  if (issue.status.toString() === '1') {
    return issue.newHtml
  }

  return (issue.newHtml) ? issue.newHtml : issue.sourceHtml
}

export function getAccessibleName(element) {
  if ('string' === typeof element) {
    element = toElement(element)
  }

  if (!element) {
    return ''
  }

  /* Accessible Names for different elements can be computed differently, as described here:
    https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#name_calculation  */

  // 1. TODO: If the element has the 'aria-labelledby' attribute, use the value of the corresponding element.
  
  // 2. If the element has the 'aria-label' attribute, use that value.
  let ariaLabel = getAttribute(element, 'aria-label')
  if(ariaLabel) {
    return ariaLabel
  }

  // 3. Run a BUNCH of tag-specific and role-specific logic.
  let tagName = getTagName(element).toLowerCase()
  let type = getAttribute(element, 'type')?.toLowerCase()
  
  let value = getAttribute(element, 'value')

  if(tagName === 'input' && (type === 'button' || type === 'submit' || type === 'reset')) {
    if(value) { return value }
  }

  let alt = getAttribute(element, 'alt')

  if((tagName === 'input' && type === 'image')
      || tagName === 'img'
      || tagName === 'area') {
    if(alt) { return alt }
  }

  if(tagName === 'fieldset') {
    let legend = element.querySelector('legend')
    if(legend) {
      return getInnerText(legend)
    }
  }

  if(tagName === 'figure') {
    let figcaption = element.querySelector('figcaption')
    if(figcaption) {
      return getInnerText(figcaption)
    }
  }

  if(tagName === 'table') {
    let caption = element.querySelector('caption')
    if(caption) {
      return getInnerText(caption)
    }
  }
  
  // 4. TODO: "If the name is still empty, then for elements with a role that supports naming
  // from child content, the content of the element is used."

  // 5. TODO: "Finally, if the name is still empty, then other fallback host-language-specific
  // attributes or elements are used if present [such as localized 'Submit Query']"

  let title = getAttribute(element, "title")
  if(title) {
    return title
  }
   
  return ''
}