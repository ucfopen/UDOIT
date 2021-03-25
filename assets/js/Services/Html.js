class Html {
  constructor() {
    this.processStaticHtml = this.processStaticHtml.bind(this)
  }

  toElement(htmlString) {
    if ('string' !== typeof htmlString) {
      return htmlString
    }

    let tmp = document.createElement('template')
    tmp.innerHTML = htmlString.trim()

    return tmp.content.firstChild
  }

  toString(element) {
    if (!element) {
      return ''
    }
    return element.outerHTML
  }

  getInnerText(element) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    // TODO: add logic that looks for multiple text nodes, factors in children elements, etc
    return element.innerText
  }

  setInnerText(element, newText) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    const children = element.childNodes
    let textNodeFound = false

    console.log(children)

    children.forEach(function(node, index) {
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

  getAttribute(element, name) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    if (!element) {
      return null
    }

    return element.getAttribute(name)
  }

  setAttribute(element, name, value) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    if (!element) {
      return null
    }

    element.setAttribute(name, value)

    return element
  }

  removeAttribute(element, name) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    if (!element) {
      return null
    }

    element.removeAttribute(name)

    return element
  }

  getClasses(element) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    if (!element) {
      return []
    }

    let classes = element.getAttribute('class')

    return (classes) ? classes.split(' ') : []
  }

  addClass(element, className) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    if (!element) {
      return null
    }

    let classes = this.getClasses(element)
    classes.push(className)
    let uniqueClasses = [...new Set(classes)]

    element.setAttribute('class', uniqueClasses.join(' '))

    return element;
  }

  removeClass(element, className) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    if (!element) {
      return null
    }

    let classes = this.getClasses(element)
    classes = classes.filter(item => item !== className)

    element.setAttribute('class', classes.join(' '))

    return element;
  }

  getTagName(element) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    if (!element) {
      return null
    }

    return element.tagName
  }

  removeTag(element, name) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    if (!element) {
      return null
    }

    let outerTag = RegExp('<'.concat(name.toLowerCase()).concat('>'))

    element.innerHTML = element.innerHTML.replace(outerTag, "")
    
    return element
  }

  renameElement(element, newName) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    if (!element) {
      return null
    }

    var obj = element.attributes
    var attributes = Array.prototype.slice.call(obj)
    var newElement = document.createElement(newName)

    // Add attributes to new element
    attributes.forEach(
      function (attribute) {
        newElement = this.setAttribute(
          newElement,
          attribute.nodeName,
          attribute.nodeValue
        )
      }.bind(this)
    )

    newElement.innerHTML = element.innerHTML

    return newElement
  }

  prepareLink(element) {
    if ('string' === typeof element) {
      element = this.toElement(element)
    }

    if (!element) {
      return null
    }

    if (element.nodeName === 'A') {
      element = this.setAttribute(element, "target", "_blank")
    }

    let children = Array.from(element.childNodes)

    children.forEach(function(child) {
      if (child.nodeName === 'A') {
        child = this.setAttribute(child, "target", "_blank")
      }
    }.bind(this))

    return element;
  }

  processStaticHtml(nodes) {
    const baseUrl = document.referrer.endsWith('/') ? document.referrer.slice(0, -1) : document.referrer
    
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
        node.children = this.processStaticHtml(node.children)
      }
    }

    return nodes    
  }
}

export default new Html()
