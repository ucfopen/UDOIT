import React, { useEffect, useState } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import ToggleSwitch from '../Widgets/ToggleSwitch'
import * as Text from '../../Services/Text'
import * as Html from '../../Services/Html'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function BlockquoteForm({
  t,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  activeContentItem,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
 }) {
  
  const FORM_OPTIONS = {
    ADD_CITATION: UFIXIT_OPTIONS.ADD_TEXT,
    STYLE_ONLY: UFIXIT_OPTIONS.ADD_EMPHASIS
  }

  const [textInputValue, setTextInputValue] = useState("")
  const [hideCitation, setHideCitation] = useState(false)

  // Re-init form when activeIssue changes
  useEffect(() => {
    if (!activeIssue) {
      return
    }

    const html = Html.getIssueHtml(activeIssue);
    const element = Html.toElement(html);
    let tempCitationText = ""
    let inlineCite = ""
    let elementCite = null
    
    const isBlockquote = element && element?.tagName?.toLowerCase() === 'blockquote'
    if(isBlockquote) {
      inlineCite = element.querySelector('[cite]')?.getAttribute('cite');
      elementCite = element.querySelector('cite')?.innerText;
      tempCitationText = (elementCite ? elementCite : inlineCite ? inlineCite : '').trim();
    }

    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3)
    let startingOption = ''

    if (fixed) {
      if (!isBlockquote) {
        startingOption = FORM_OPTIONS.STYLE_ONLY
      }
      else if (tempCitationText && tempCitationText.length > 0) {
        startingOption = FORM_OPTIONS.ADD_CITATION
      }
    }

    setTextInputValue(tempCitationText || "")
    setHideCitation(inlineCite && !elementCite)
    setActiveOption(startingOption)

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, textInputValue, hideCitation])

  const updateHtmlContent = () => {
    let issue = activeIssue;
    let element = Html.toElement(issue.initialHtml);
    
    if (activeOption === FORM_OPTIONS.STYLE_ONLY) {

      // Duplicate the blockquote content in a <div>, and style it to match.
      const styleOnlyElement = Html.renameElement(element, "div");
      Html.setAttribute(styleOnlyElement, "style", "padding-inline-start: 1em;border-inline-start: 5px solid rgba(128, 128, 128, .4);font-weight:300;margin:1em 0;");
      const existingCite = styleOnlyElement.querySelector('cite');
      if (existingCite) {
        const pCiteElement = Html.renameElement(existingCite, "p");
        existingCite.replaceWith(pCiteElement);
      }
      issue.newHtml = Html.toString(styleOnlyElement);
      handleActiveIssue(issue);
    }

    if (activeOption === FORM_OPTIONS.ADD_CITATION) {
      // If the issue has been saved/fixed as a div, we may need to revert to a blockquote here.
      const blockquoteElement = Html.renameElement(element, "blockquote");
      if (hideCitation) {
        Html.setAttribute(blockquoteElement, 'cite', textInputValue)
        // Remove any existing cite tag, as it will not be used
        const existingCite = blockquoteElement.querySelector('cite')
        if (existingCite) {
          existingCite.remove()
        }
      }
      else {
        // If the blockquote already has a cite tag, update it
        const existingCite = blockquoteElement.querySelector('cite')
        if (existingCite) {
          existingCite.textContent = textInputValue
        } else {
          // Otherwise, create a new cite element and append it
          const citeElement = document.createElement('cite')
          citeElement.textContent = textInputValue
          blockquoteElement.appendChild(citeElement)
        }
        blockquoteElement.removeAttribute('cite')
      }
      issue.newHtml = Html.toString(blockquoteElement);
      handleActiveIssue(issue);
    }
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_CITATION]: [],
      [FORM_OPTIONS.STYLE_ONLY]: [],
    }

    if (activeOption === FORM_OPTIONS.ADD_CITATION) {
      if (Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_CITATION].push({text: t('form.blockquote.msg.text_empty'), type: 'error'})
      }
    }

    setFormErrors(tempErrors)
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  return (
    <>
      {/* OPTION 1: Add text. ID: "ADD_CITATION" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_CITATION ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_CITATION}
          labelId = 'add-text-label'
          labelText = {t('form.blockquote.decision.blockquote')}
        />

        {activeOption === FORM_OPTIONS.ADD_CITATION && (
          <>
            <div className="instructions mb-2">{t('form.blockquote.label.text')}</div>
            <input
              aria-labelledby="add-text-label"
              type="text"
              tabIndex="0"
              id="altTextInput"
              name="altTextInput"
              className="w-100"
              value={textInputValue}
              disabled={isDisabled}
              onChange={handleInput}
            />
            <label>
              <ToggleSwitch
                initialValue={hideCitation}
                updateToggle={setHideCitation}
                disabled={isDisabled}
                small={true}
              />
              <div>{t('form.blockquote.label.hide_citation')}</div>
            </label>
            <div className="subtext">{t('form.blockquote.label.hide_citation_desc')}</div>
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.ADD_CITATION]}
            />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Decorative. ID: "STYLE_ONLY" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.STYLE_ONLY ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.STYLE_ONLY}
          labelText = {t('form.blockquote.decision.style')}
        />
      </div>
    </>
  )
}