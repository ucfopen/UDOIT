import React, { useEffect, useState } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import ToggleSwitch from '../Widgets/ToggleSwitch'
import * as Text from '../../Services/Text'
import * as Html from '../../Services/Html'

export default function BlockquoteForm({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
 }) {
  
  const FORM_OPTIONS = {
    ADD_TEXT: settings.UFIXIT_OPTIONS.ADD_TEXT,
    REMOVE_BLOCKQUOTE: settings.UFIXIT_OPTIONS.DELETE_ELEMENT,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  const [textInputValue, setTextInputValue] = useState("")
  const [hideCitation, setHideCitation] = useState(false)

  // Re-init form when activeIssue changes
  useEffect(() => {
    if (!activeIssue) {
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    let tempCitationText = ""
    let inlineCite = ""
    let elementCite = null
    let tempElement = Html.toElement(html)
    const isBlockquote = tempElement && tempElement.tagName.toLowerCase() === 'blockquote'
    if(isBlockquote) {
      tempElement = embedTextOnlyInParagraph(tempElement)
      inlineCite = tempElement ? Html.getAttribute(tempElement, "cite") : ""
      elementCite = Html.getChild(tempElement, "cite")
      tempCitationText = elementCite ? elementCite.textContent : inlineCite
      if(!tempCitationText) {
        tempCitationText = ""
      } else {
        tempCitationText = tempCitationText.trim()
      }
    }
    const removeBlockquote = (activeIssue.status === 1 || activeIssue.status === 3) && !isBlockquote
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)

    if (reviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else if (removeBlockquote) {
      setActiveOption(FORM_OPTIONS.REMOVE_BLOCKQUOTE)
    }
    else if (tempCitationText && tempCitationText.length > 0) {
      setActiveOption(FORM_OPTIONS.ADD_TEXT)
    } else {
      setActiveOption('')
    }

    setTextInputValue(tempCitationText || "")
    setHideCitation(inlineCite && !elementCite)
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, textInputValue, hideCitation])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }
    
    issue.newHtml = processHtml(issue.initialHtml)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_TEXT]: [],
      [FORM_OPTIONS.REMOVE_BLOCKQUOTE]: [],
    }

    if (activeOption === FORM_OPTIONS.ADD_TEXT) {
      if (Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({text: t('form.blockquote.msg.text_empty'), type: 'error'})
      }
    }

    setFormErrors(tempErrors)
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
    if(!html || !updatedElement) {
      return ''
    }

    const isBlockquote = updatedElement && updatedElement.tagName.toLowerCase() === 'blockquote'
    if (!isBlockquote && !(activeOption === FORM_OPTIONS.REMOVE_BLOCKQUOTE)) {
      // We need to wrap the content in a blockquote tag
      const newBlockquote = document.createElement('blockquote')
      updatedElement.childNodes.forEach(node => {
        newBlockquote.appendChild(node)
      })
      updatedElement = newBlockquote
    }

    updatedElement = embedTextOnlyInParagraph(updatedElement)

    if (activeOption === FORM_OPTIONS.ADD_TEXT) {
      if (hideCitation) {
        updatedElement = Html.setAttribute(updatedElement, 'cite', textInputValue)
        // Remove any existing cite tag, as it will not be used
        const existingCite = updatedElement.querySelector('cite')
        if (existingCite) {
          existingCite.remove()
        }
      }
      else {
        // If the blockquote already has a cite tag, update it
        const existingCite = updatedElement.querySelector('cite')
        if (existingCite) {
          existingCite.textContent = textInputValue
        } else {
          // Otherwise, create a new cite element and append it
          const citeElement = document.createElement('cite')
          citeElement.textContent = textInputValue
          updatedElement.appendChild(citeElement)
        }
        updatedElement.removeAttribute('cite')
      }
    }

    if (activeOption === FORM_OPTIONS.REMOVE_BLOCKQUOTE) {
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

    const newHtmlString = Html.toString(updatedElement)
    return newHtmlString
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  return (
    <>
      {/* OPTION 1: Add text. ID: "ADD_TEXT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_TEXT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_TEXT}
          labelId = 'add-text-label'
          labelText = {t('form.blockquote.label.text')}
          />

        {activeOption === FORM_OPTIONS.ADD_TEXT && (
          <>
            <input
              aria-labelledby="add-text-label"
              type="text"
              tabIndex="0"
              id="altTextInput"
              name="altTextInput"
              className="w-100"
              value={textInputValue}
              disabled={isDisabled}
              onChange={handleInput} />
            <div className="flex-row justify-content-start gap-1 mt-3">
              <ToggleSwitch
                labelId="hideCitationToggle"
                initialValue={hideCitation}
                updateToggle={setHideCitation}
                disabled={isDisabled}
                small={true} />
              <label htmlFor="hideCitationToggle" className="ufixit-instructions">{t('form.blockquote.label.hide_citation')}</label>
            </div>
            <div className="subtext">{t('form.blockquote.label.hide_citation_desc')}</div>
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]} />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Decorative. ID: "REMOVE_BLOCKQUOTE" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.REMOVE_BLOCKQUOTE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.REMOVE_BLOCKQUOTE}
          labelText = {t('form.blockquote.label.remove_blockquote')}
          />
      </div>

      {/* OPTION 3: Mark as Reviewed. ID: "MARK_AS_REVIEWED" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_AS_REVIEWED}
          labelText = {t('fix.label.no_changes')}
          />
      </div>
    </>
  )
}