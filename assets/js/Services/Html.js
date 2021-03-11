class Html {
  toElement(htmlString) {
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

    children.forEach(function (node, index) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.nodeValue = newText
        textNodeFound = true
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

    let outerTag = RegExp('<'.concat(name).concat('>'))

    element.innerHTML = element.innerHTML.replace(outerTag, '')

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
    if ('a' !== element.tagName && !element.href) {
      return null
    }

    return this.setAttribute(element, 'target', '_blank')
  }
}

export default new Html()
