import React, { useEffect, useState } from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'

export default function BlockquoteForm({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed
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
    let newCite = ""
    let inlineCite = ""
    let elementCite = null
    let tempElement = Html.toElement(html)
    const isBlockquote = tempElement && tempElement.tagName.toLowerCase() === 'blockquote'
    if(isBlockquote) {
      tempElement = embedTextOnlyInParagraph(tempElement)
      inlineCite = tempElement ? Html.getAttribute(tempElement, "cite") : ""
      elementCite = Html.getChild(tempElement, "cite")
      newCite = elementCite ? elementCite.textContent : inlineCite
    }

    setCitationText(newCite || "")
    setHideCitation(inlineCite && !elementCite)
    setRemoveBlockquote(!isBlockquote)
    setFormErrors([])
    setTriggerCheck(!triggerCheck) // Trigger a check (below) to ensure the form updates correctly
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [citationText, hideCitation, removeBlockquote, triggerCheck, markAsReviewed])

  const updateHtmlContent = () => {

    let issue = activeIssue
    issue.isModified = true

    if (markAsReviewed) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }
    
    const html = Html.getIssueHtml(activeIssue)
    issue.newHtml = processHtml(html)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    const tempFormErrors = []

    if (!removeBlockquote) {
      if(Text.isTextEmpty(citationText)) {
        tempFormErrors.push({text: t('form.blockquote.msg.text_empty'), type: 'error'})
      }
    }

    setFormErrors(tempFormErrors)
  }

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




  const processHtml = (html) => {
    let updatedElement = Html.toElement(html)
    if(!updatedElement) {
      return ''
    }

    const isBlockquote = updatedElement && updatedElement.tagName.toLowerCase() === 'blockquote'

    // Case 1: Element is NOT a blockquote any more ("fixed" by the user), but they haven't unchecked the "remove blockquote" checkbox...
    if(!isBlockquote && removeBlockquote) {
      return Html.toString(updatedElement)
    }

    // Case 2: Element is NOT a blockquote, but the user has unchecked the "remove blockquote" checkbox... Make it a blockquote again and continue.
    if(!isBlockquote && !removeBlockquote) {
      // We need to wrap the content in a blockquote tag
      const newBlockquote = document.createElement('blockquote')
      updatedElement.childNodes.forEach(node => {
        newBlockquote.appendChild(node)
      })
      updatedElement = newBlockquote
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
      // Remove any existing cite tag, as it will not be used
      const existingCite = updatedElement.querySelector('cite')
      if (existingCite) {
        existingCite.remove()
      }
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
      // Remove the cite attribute if it exists
      updatedElement.removeAttribute('cite')
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
    if(markAsReviewed || formErrors.length === 0) {
      handleIssueSave({ ...activeIssue, newHtml: activeIssue.newHtml })
    }
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
          tabIndex="0"
          onChange={(e) => handleInput(e.target.value)} />
      </div>

      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="hideCheckbox"
          name="hideCheckbox"
          checked={hideCitation}
          tabIndex="0"
          disabled={isDisabled || removeBlockquote}
          onChange={handleHideToggle} />
        <label className="instructions" htmlFor="hideCheckbox">{t('form.blockquote.label.hide_citation')}</label>
      </div>
      <div className="instructions-helper">{t('form.blockquote.label.hide_citation_desc')}</div>

      <div className="separator mt-2">{t('fix.label.or')}</div>

      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="removeCheckbox"
          name="removeCheckbox"
          checked={removeBlockquote}
          tabIndex="0"
          disabled={isDisabled}
          onChange={handleRemoveToggle} />
        <label className="instructions" htmlFor="removeCheckbox">{t('form.blockquote.label.remove_blockquote')}</label>
      </div>
      
      <FormSaveOrReview
        t={t}
        settings={settings}
        activeIssue={activeIssue}
        isDisabled={isDisabled}
        handleSubmit={handleSubmit}
        formErrors={formErrors}
        markAsReviewed={markAsReviewed}
        setMarkAsReviewed={setMarkAsReviewed} />
    </>
  )
}