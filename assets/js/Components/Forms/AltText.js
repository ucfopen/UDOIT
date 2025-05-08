import React, { useState, useEffect } from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html'

export default function AltText ({
  t,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
 }) {
  
  const maxLength = 150

  const [textInputValue, setTextInputValue] = useState('')
  const [isDecorative, setIsDecorative] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const [textInputErrors, setTextInputErrors] = useState([])

  useEffect(() => {
    if (activeIssue) {
      const html = Html.getIssueHtml(activeIssue)
      let altText = Html.getAttribute(html, 'alt')
      altText = (typeof altText === 'string') ? altText : ''

      setTextInputValue(altText)
      setIsDecorative((elementIsDecorative(html) === 'true'))
      setCharacterCount(altText.length)
      setTextInputErrors([])
    }
  }, [activeIssue])

  useEffect(() => {
    updateActiveIssueHtml()
    checkFormErrors()
  }, [textInputValue, isDecorative])

  const updateActiveIssueHtml = () => {
    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    
    if (isDecorative) {
      element = Html.setAttribute(element, "role", "presentation")
      element = Html.setAttribute(element, 'alt', '')
    } else {
      element = Html.removeAttribute(element, "role")
      element = Html.setAttribute(element, "alt", textInputValue)
    }

    let issue = activeIssue
    issue.newHtml = Html.toString(element)

    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = []
    
    // If the "Mark as Decorative" checkbox is checked, we don't need to check for input errors
    if (!isDecorative) {
      if(isTextEmpty()){
        tempErrors.push({ text: t('form.alt_text.msg.text_empty'), type: 'error' })
      }
      if(isTextTooLong()){
        tempErrors.push({ text: t('form.alt_text.msg.text_too_long'), type: 'error' })
      }
      if(hasFileExtensions()) {
        tempErrors.push({ text: t('form.alt_text.msg.text_has_file_extension'), type: 'error' })
      }
      if(hasFileName()) {
        tempErrors.push({ text: t('form.alt_text.msg.text_matches_filename'), type: 'error' })
      }
    }

    setTextInputErrors(tempErrors)
  }

  const handleSubmit = () => {
    if (textInputErrors.length === 0) {
      handleIssueSave(activeIssue)
    }
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
    setCharacterCount(event.target.value.length)
  }

  const handleCheckbox = () => {
    setIsDecorative(!isDecorative)
  }

  const isTextEmpty = () => {
    const text = textInputValue.trim().toLowerCase()

    if (text === '') {
      return true
    }
    return false
  }

  const isTextTooLong = () => {
    const text = textInputValue.trim().toLowerCase()

    if (text.length > maxLength) {
      return true
    }
    return false
  }

  const hasFileExtensions = () => {
    let fileRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.png|.jpg|.jpeg|.gif)$/i

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
      <label htmlFor="altTextInput">{t('form.alt_text.label.text')}</label>
      <div className="w-100 mt-2">
        <input
          type="text"
          tabindex="0"
          id="altTextInput"
          name="altTextInput"
          className="w-100"
          value={textInputValue}
          disabled={isDisabled || isDecorative}
          onChange={handleInput} />
      </div>
      <div className="flex-row justify-content-end mt-1">
        <div className="text-muted">
          {t('form.alt_text.feedback.characters', {current: characterCount, total: maxLength})}
        </div>
      </div>
      <FormFeedback issues={textInputErrors} />
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input
          type="checkbox"
          id="decorativeCheckbox"
          name="decorativeCheckbox"
          tabindex="0"
          disabled={isDisabled}
          checked={isDecorative}
          onChange={handleCheckbox} />
        <label htmlFor="decorativeCheckbox">{t('form.alt_text.label.mark_decorative')}</label>
      </div>
      <div className="flex-row justify-content-start mt-3 mb-3">
        <button
          className="btn btn-primary"
          disabled={isDisabled || textInputErrors.length > 0}
          tabindex="0"
          onClick={handleSubmit}>
          {t('form.submit')}
        </button>
      </div>
    </>
  )
}