import React, { useState, useEffect } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function AltText ({
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
    MARK_DECORATIVE: settings.UFIXIT_OPTIONS.MARK_DECORATIVE,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }
  const maxLength = 150

  const [textInputValue, setTextInputValue] = useState('')
  const [characterCount, setCharacterCount] = useState(0)

  useEffect(() => {
    if (!activeIssue) {
      return
    }
    const html = Html.getIssueHtml(activeIssue)
    let altText = Html.getAttribute(html, 'alt')
    altText = (typeof altText === 'string') ? altText : ''

    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)

    setTextInputValue(altText)
    setCharacterCount(altText.length)
    setFormErrors([])

    if (reviewed){
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else if (altText && altText.length > 0) {
      setActiveOption(FORM_OPTIONS.ADD_TEXT)
    } else if (elementIsDecorative(html)) {
      setActiveOption(FORM_OPTIONS.MARK_DECORATIVE)
    } else {
      setActiveOption('')
    }
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, activeOption])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    
    if (activeOption === FORM_OPTIONS.MARK_DECORATIVE) {
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
    
    if (activeOption === FORM_OPTIONS.ADD_TEXT) {
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
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_TEXT}
          labelId = 'add-text-label'
          labelText = {t('form.alt_text.label.text')}
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
            <div className="subtext">{t("form.alt_text.feedback.characters", { current: characterCount, total: maxLength })}</div>
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]} />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Decorative. ID: "mark-decorative" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_DECORATIVE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_DECORATIVE}
          labelText = {t('form.alt_text.label.mark_decorative')}
          />
      </div>

      {/* OPTION 3: Mark as Reviewed. ID: "mark-as-reviewed" */}
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