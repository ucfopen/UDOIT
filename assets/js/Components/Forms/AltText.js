import React, { useState, useEffect } from 'react'
import SeverityIcon from '../Icons/SeverityIcon'
import * as Html from '../../Services/Html'

export default function AltText ({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  addMessage,
  handleActiveIssue,
  handleManualScan
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
    handleHtmlUpdate()
    setTextInputErrors(checkFormErrors())
  }, [textInputValue, isDecorative])

  const handleHtmlUpdate = () => {
    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    
    if (isDecorative) {
      element = Html.setAttribute(element, "role", "presentation")
      element = Html.addClass(element, 'phpally-ignore')
      element = Html.setAttribute(element, 'alt', '')
    } else {
      element = Html.removeAttribute(element, "role")
      element = Html.removeClass(element, 'phpally-ignore')
      element = Html.setAttribute(element, "alt", textInputValue)
    }

    let issue = activeIssue
    issue.newHtml = Html.toString(element)

    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = []
    
    if (!isDecorative) {
      const notEmptyError = checkTextNotEmpty()
      const lengthError = checkTextLength()
      const fileExtensionError = checkForFileExtensions()
      const fileNameError = checkFileName()

      if (notEmptyError) {
        tempErrors.push(notEmptyError)
      }
      if (lengthError) {
        tempErrors.push(lengthError)
      }
      if (fileExtensionError) {
        tempErrors.push(fileExtensionError)
      }
      if (fileNameError) {
        tempErrors.push(fileNameError)
      }
    }

    return tempErrors
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

  const checkTextNotEmpty = () => {
    const text = textInputValue.trim().toLowerCase()
    if (text === '') {
      return { text: t('form.alt_text.msg.text_empty'), type: 'error' }
    }
    return false
  }

  const checkTextLength = () => {
    const text = textInputValue.trim().toLowerCase()
    if (text.length > maxLength) {
      return { text: t('form.alt_text.msg.text_too_long'), type: 'error' }
    }
    return false
  }

  const checkForFileExtensions = () => {
    let fileRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.png|.jpg|.jpeg|.gif)$/i

    if (textInputValue.match(fileRegex) != null) {
      return { text: t('form.alt_text.msg.text_has_file_extension'), type: 'error' }
    }
    return false
  }

  const checkFileName = () => {
    let fileName = Html.getAttribute(activeIssue.sourceHtml, "src")
    
    if (textInputValue === fileName) {
      return { text: t('form.alt_text.msg.text_matches_filename'), type: 'error' }
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
          id="altTextInput"
          name="altTextInput"
          className="w-100"
          value={textInputValue}
          disabled={isDecorative}
          onChange={handleInput} />
      </div>
      <div className="flex-row justify-content-end mt-1">
        <div className="text-muted">
          {t('form.alt_text.feedback.characters', {current: characterCount, total: maxLength})}
        </div>
      </div>
      {textInputErrors.length > 0 && (
        <div className="flex-column mt-2">
          {textInputErrors.map((error, index) => (
            <div className="flex-row justify-content-end gap-1" key={index}>
              <div className="flex-column flex-center">
                <SeverityIcon type="ISSUE" className="icon-sm" />
              </div>
              <div className="flex-column flex-center">
                <div className="error-text">{error.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="decorativeCheckbox"
          name="decorativeCheckbox"
          checked={isDecorative}
          onChange={handleCheckbox} />
        <label htmlFor="decorativeCheckbox">{t('form.alt_text.label.mark_decorative')}</label>
      </div>
      <div className="flex-row justify-content-start mt-3 mb-3">
        <button className="btn btn-primary" disabled={textInputErrors.length > 0} onClick={handleSubmit}>{t('form.submit')}</button>
      </div>
    </>
  )
}