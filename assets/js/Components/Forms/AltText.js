import React, { useState, useEffect } from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function AltText ({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed
 }) {
  
  const maxLength = 150

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
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, isDecorative, markAsReviewed])

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
    let tempErrors = []
    
    // If the "Mark as Decorative" checkbox is checked, we don't need to check for input errors
    if (!isDecorative && !markAsReviewed) {
      if(Text.isTextEmpty(textInputValue)){
        tempErrors.push({ text: t('form.alt_text.msg.text_empty'), type: 'error' })
      }
      if(Text.isTextTooLong(textInputValue, maxLength)){
        tempErrors.push({ text: t('form.alt_text.msg.text_too_long'), type: 'error' })
      }
      if(hasFileExtensions()) {
        tempErrors.push({ text: t('form.alt_text.msg.text_has_file_extension'), type: 'error' })
      }
      if(hasFileName()) {
        tempErrors.push({ text: t('form.alt_text.msg.text_matches_filename'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const handleSubmit = () => {
    if (markAsReviewed || formErrors.length === 0) {
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
      <label htmlFor="altTextInput" className="instructions">{t('form.alt_text.label.text')}</label>
      <div className="w-100 mt-2">
        <input
          type="text"
          tabIndex="0"
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
      <div className="separator mt-2">{t('fix.label.or')}</div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input
          type="checkbox"
          id="decorativeCheckbox"
          name="decorativeCheckbox"
          tabIndex="0"
          disabled={isDisabled}
          checked={isDecorative}
          onChange={handleCheckbox} />
        <label htmlFor="decorativeCheckbox" className="instructions">{t('form.alt_text.label.mark_decorative')}</label>
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