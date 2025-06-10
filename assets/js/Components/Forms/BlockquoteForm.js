import React, { useEffect, useState } from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html'

export default function BlockquoteForm({
  t,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue
}) {

  const [citationText, setCitationText] = useState("")
  const [hideCitation, setHideCitation] = useState(false)
  const [removeBlockquote, setRemoveBlockquote] = useState(false)
  const [formErrors, setFormErrors] = useState([])
  const [triggerCheck, setTriggerCheck] = useState(false)

  // Re-init form when activeIssue changes
  useEffect(() => {

    if (!activeIssue) {
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    let tempElement = Html.toElement(html)
    tempElement = embedTextOnlyInParagraph(tempElement)

    const inlineCite = tempElement ? Html.getAttribute(tempElement, "cite") : ""
    const elementCite = Html.getChild(tempElement, "cite")
    const isBlockquote = tempElement && tempElement.tagName.toLowerCase() === 'blockquote'

    const newCite = elementCite ? elementCite.textContent : inlineCite

    setCitationText(newCite || "")
    setHideCitation(inlineCite && !elementCite)
    setRemoveBlockquote(!isBlockquote)
    setFormErrors([])
    setTriggerCheck(!triggerCheck) // Trigger a check (below) to ensure the form updates correctly
  }, [activeIssue])

  useEffect(() => {
    checkFormErrors()
    handleHtmlUpdate()
  }, [citationText, hideCitation, removeBlockquote, triggerCheck])

  // If the blockquote only contains text, we return that text wrapped in a <p> tag
  const embedTextOnlyInParagraph = (element) => {
    const filteredNodes = Array.from(element.childNodes).filter(node => {
      // Filter out empty text nodes (happens with line breaks))
      return node.nodeType !== Node.TEXT_NODE || node.textContent.trim() !== ''
    })
    // If the blockquote only contains text, we return it as a <p> tag
    if (filteredNodes && filteredNodes.length === 1 && filteredNodes[0].nodeType === Node.TEXT_NODE) {
      let newElement = document.createElement('p')
      newElement.textContent = filteredNodes[0].textContent.trim()
      let newBlockquote = document.createElement('blockquote')
      newBlockquote.appendChild(newElement)
      return newBlockquote
    }

    return element
  }

  const checkFormErrors = () => {
    const tempFormErrors = []

    if (!removeBlockquote && citationText.trim() === '') {
      tempFormErrors.push({text: t('form.blockquote.msg.text_empty'), type: 'error'})
    }

    setFormErrors(tempFormErrors)
  }

  const handleHtmlUpdate = () => {
      let issue = activeIssue
      const html = Html.getIssueHtml(activeIssue)
  
      issue.newHtml = processHtml(html)
      handleActiveIssue(issue)
    }

  const processHtml = (html) => {
    let updatedElement = Html.toElement(html)
    if(!updatedElement) {
      return ''
    }

    updatedElement = embedTextOnlyInParagraph(updatedElement)

    // If the blockquote is to be removed...
    if (removeBlockquote) {

      const filteredNodes = Array.from(updatedElement.childNodes).filter(node => {
        // Filter out empty text nodes and non-block level elements
        return node.nodeType !== Node.TEXT_NODE || node.textContent.trim() !== ''
      })
      
      // If the blockquote ONLY contains tagged elements, we can return them as is
      if (Array.from(filteredNodes).every(node => {
        return node.nodeType !== Node.TEXT_NODE
      })) {
          return updatedElement.innerHTML
      }

      // If the blockquote contains open text with additional HTML elements, we need to wrap it in a <p> tag
      else {
        let newElement = document.createElement('p')
        filteredNodes.forEach(node => {
          newElement.appendChild(node)
        })
        return Html.toString(newElement)
      }
    }

    // If the citation is present but needs to be visually hidden, add it as the cite attribute
    if (hideCitation && citationText.length > 0) {
      updatedElement = Html.setAttribute(updatedElement, 'cite', citationText)
    }

    // If the citation is not hidden, we want to update or add the cite tag inside the blockquote
    if (!hideCitation && citationText.length > 0) {
      if (citationText.length > 0) {
        // If the blockquote already has a cite tag, update it
        const existingCite = updatedElement.querySelector('cite')
        if (existingCite) {
          existingCite.textContent = citationText
        } else {
          // Otherwise, create a new cite element and append it
          const citeElement = document.createElement('cite')
          citeElement.textContent = citationText
          updatedElement.appendChild(citeElement)
        }
      }
    }

    const newHtmlString = Html.toString(updatedElement)
    return newHtmlString
  }

  const handleInput = (newValue) => {
    setCitationText(newValue)
  }

  const handleHideToggle = () => {
    setHideCitation(!hideCitation)
  }

  const handleRemoveToggle = () => {
    setRemoveBlockquote(!removeBlockquote)
  }

  const handleSubmit = () => {
    if(formErrors.length > 0) {
      return
    }
    handleIssueSave({ ...activeIssue, newHtml: activeIssue.newHtml })
  }

  return (
    <>
      <label className="instructions" htmlFor="blockquoteCiteInput">{t('form.blockquote.label.text')}</label>
      <div className="w-100 mt-2">
        <input
          type="text" 
          id="blockquoteCiteInput"
          name="blockquoteCiteInput"
          className="w-100"
          value={citationText}
          disabled={isDisabled || removeBlockquote}
          placeholder={t('form.blockquote.text.placeholder')}
          tabindex="0"
          onChange={(e) => handleInput(e.target.value)} />
      </div>

      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="hideCheckbox"
          name="hideCheckbox"
          checked={hideCitation}
          tabindex="0"
          disabled={isDisabled || removeBlockquote}
          onChange={handleHideToggle} />
        <label className="instructions" htmlFor="hideCheckbox">{t('form.blockquote.label.hide_citation')}</label>
      </div>
      <div className="mt-1">
        <em>{t('form.blockquote.label.hide_citation_desc')}</em>
      </div>

      <div className="separator mt-2">{t('fix.label.or')}</div>

      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="removeCheckbox"
          name="removeCheckbox"
          checked={removeBlockquote}
          tabindex="0"
          disabled={isDisabled}
          onChange={handleRemoveToggle} />
        <label className="instructions" htmlFor="removeCheckbox">{t('form.blockquote.label.remove_blockquote')}</label>
      </div>
      
      <FormFeedback
        t={t}
        isDisabled={isDisabled || formErrors.length > 0}
        handleSubmit={handleSubmit}
        formErrors={formErrors} />
    </>
  )
}