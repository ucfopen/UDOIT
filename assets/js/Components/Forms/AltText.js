import React, { useState, useEffect } from 'react'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function AltText ({
  t,

  activeIssue,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed,
  setFormInvalid
 }) {
  
  const maxLength = 150
  const FORM_OPTIONS = {
    ADD_TEXT: 'add-text',
    MARK_DECORATIVE: 'mark-decorative',
    MARK_AS_REVIEWED: 'mark-as-reviewed'
  }

  const [activeOption, setActiveOption] = useState('')
  const [textInputValue, setTextInputValue] = useState('')
  const [isDecorative, setIsDecorative] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const [formErrors, setFormErrors] = useState([])

  useEffect(() => {
    if (!activeIssue) {
      return
    }
    const html = Html.getIssueHtml(activeIssue)
    let altText = Html.getAttribute(html, 'alt')
    altText = (typeof altText === 'string') ? altText : ''

    setTextInputValue(altText)
    setIsDecorative((elementIsDecorative(html) === 'true'))
    setCharacterCount(altText.length)
    setFormErrors([])

    if (altText && altText.length > 0) {
      setActiveOption(FORM_OPTIONS.ADD_TEXT)
    } else if (elementIsDecorative(html)) {
      setActiveOption(FORM_OPTIONS.MARK_DECORATIVE)
    } else if (markAsReviewed){
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    } else {
      setActiveOption('')
    }
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, isDecorative, markAsReviewed])

  useEffect(() => {
    let invalid = false
    if(!markAsReviewed) {
      Object.keys(formErrors).forEach(optionKey => {
        if(formErrors[optionKey].length > 0) {
          invalid = true
        }
      })
    }
    setFormInvalid(invalid)
  }, [formErrors, markAsReviewed])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

    if (markAsReviewed) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    
    if (isDecorative) {
      element = Html.setAttribute(element, "role", "presentation")
      element = Html.setAttribute(element, 'alt', '')
      element = Html.setAttribute(element, 'title', '')
    } else {
      element = Html.removeAttribute(element, "role")
      element = Html.setAttribute(element, "alt", textInputValue)
      element = Html.setAttribute(element, "title", textInputValue)
    }

    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_TEXT]: [],
      [FORM_OPTIONS.MARK_DECORATIVE]: [],
    }
    
    // If the "Mark as Decorative" checkbox is checked, we don't need to check for input errors
    if (!isDecorative && !markAsReviewed) {
      if(Text.isTextEmpty(textInputValue)){
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.alt_text.msg.text_empty'), type: 'error' })
      }
      if(Text.isTextTooLong(textInputValue, maxLength)){
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.alt_text.msg.text_too_long'), type: 'error' })
      }
      if(hasFileExtensions()) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.alt_text.msg.text_has_file_extension'), type: 'error' })
      }
      if(hasFileName()) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.alt_text.msg.text_matches_filename'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
    setCharacterCount(event.target.value.length)
  }

  const hasFileExtensions = () => {
    let fileRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.png|.jpg|.jpeg|.gif|.bmp)$/i

    if (textInputValue.match(fileRegex) != null) {
      return true
    }
    return false
  }

  const hasFileName = () => {
    let fileName = Html.getAttribute(activeIssue.sourceHtml, "src")
    
    if (textInputValue === fileName) {
      return true
    }

    return false
  }

  const handleOptionChange = (option) => {
    setActiveOption(option)

    if (option === FORM_OPTIONS.ADD_TEXT) {
      setIsDecorative(false)
      setMarkAsReviewed(false)
    } else if (option === FORM_OPTIONS.MARK_DECORATIVE) {
      setIsDecorative(true)
      setMarkAsReviewed(false)
    } else if (option === FORM_OPTIONS.MARK_AS_REVIEWED) {
      setIsDecorative(false)
      setMarkAsReviewed(true)
    }
  }

  const elementIsDecorative = (htmlString) => {
    const decorativeAttribute = Html.getAttribute(htmlString, "data-decorative")
    const roleAttribute = Html.getAttribute(htmlString, "role")
    const classes = Html.getClasses(htmlString)

    if (Html.getTagName(htmlString) !== 'IMG') {
      return false
    }

    return (decorativeAttribute === 'true' || roleAttribute === 'presentation' || (classes.includes('phpally-ignore')))
  }

  return (
    <>
      {/* OPTION 1: Add text. ID: "add-text" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_TEXT ? 'selected' : ''}`}>
        <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
          <input
            type="radio"
            id={FORM_OPTIONS.ADD_TEXT}
            name="ufixitRadioOption"
            tabIndex="0"
            checked={activeOption === FORM_OPTIONS.ADD_TEXT}
            disabled={isDisabled}
            onChange={() => {
              handleOptionChange(FORM_OPTIONS.ADD_TEXT)
            }} />
          {t('form.alt_text.label.text')}
        </label>
        {activeOption === FORM_OPTIONS.ADD_TEXT && (
          <>
            <input
              type="text"
              tabIndex="0"
              id="altTextInput"
              name="altTextInput"
              className="w-100"
              value={textInputValue}
              disabled={isDisabled || isDecorative}
              onChange={handleInput} />
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]} />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Decorative. ID: "mark-decorative" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_DECORATIVE ? 'selected' : ''}`}>
        <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
          <input
            type="radio"
            id={FORM_OPTIONS.MARK_DECORATIVE}
            name="ufixitRadioOption"
            tabIndex="0"
            checked={activeOption === FORM_OPTIONS.MARK_DECORATIVE}
            disabled={isDisabled}
            onChange={() => {
              handleOptionChange(FORM_OPTIONS.MARK_DECORATIVE)
            }} />
          {t('form.alt_text.label.mark_decorative')}
        </label>
      </div>

      {/* OPTION 3: Mark as Reviewed. ID: "mark-as-reviewed" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
        <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
          <input
            type="radio"
            id={FORM_OPTIONS.MARK_AS_REVIEWED}
            name="ufixitRadioOption"
            tabIndex="0"
            checked={activeOption === FORM_OPTIONS.MARK_AS_REVIEWED}
            disabled={isDisabled}
            onChange={() => {
              handleOptionChange(FORM_OPTIONS.MARK_AS_REVIEWED)
            }} />
          {t('fix.label.no_changes')}
        </label>
      </div>
    </>
  )
}