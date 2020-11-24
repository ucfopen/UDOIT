class Html {
  toElement(htmlString) {
    let tmp = document.createElement('template')
    tmp.innerHTML = htmlString.trim()

    return tmp.content.firstChild
  }

  toString(element) {
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

    // TODO: add logic to handle multiple text nodes, children elements, etc
    const textNode = document.createTextNode(newText)
    element.innerText = ''
    element.appendChild(textNode)

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
}

export default new Html()