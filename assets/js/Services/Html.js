export function toElement(htmlString) {
  if ('string' !== typeof htmlString) {
    return htmlString
  }

  let tmp = document.createElement('template')
  tmp.innerHTML = htmlString.trim()

  return tmp.content.firstChild
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
  if (issue.status === '1') {
    return issue.newHtml
  }

  return (issue.newHtml) ? issue.newHtml : issue.sourceHtml
}
