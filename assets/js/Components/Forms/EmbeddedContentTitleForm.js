import React, { useEffect, useState } from 'react'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function EmbeddedContentTitleForm({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed,
  setFormInvalid
 }) {

  const FORM_OPTIONS = {
    ADD_LABEL: 'add-label',
    MARK_AS_REVIEWED: 'mark-as-reviewed'
  }

  const [activeOption, setActiveOption] = useState('')
  const [textInputValue, setTextInputValue] = useState("")
  const [formErrors, setFormErrors] = useState([])

  useEffect(() => {
    let html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    let initialText = Html.getAccessibleName(element)

    if(initialText !== '') {
      setActiveOption(FORM_OPTIONS.ADD_LABEL)
    }
    else if(markAsReviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else {
      setActiveOption('')
    }

    setTextInputValue(initialText)
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, markAsReviewed])

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

    let html = Html.getIssueHtml(activeIssue)
    let updatedElement = Html.toElement(html)

    if (activeIssue.scanRuleId == 'media_alt_exists') {
      updatedElement = Html.setAttribute(updatedElement, "aria-label", textInputValue)
      updatedElement = Html.setAttribute(updatedElement, "label", textInputValue)
    }
    else {
      updatedElement = Html.setAttribute(updatedElement, "aria-label", textInputValue)
      updatedElement = Html.setAttribute(updatedElement, "title", textInputValue)
    }

    issue.newHtml = Html.toString(updatedElement)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_LABEL]: []
    }
    
    if(!markAsReviewed) {
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_LABEL].push({ text: t('form.embedded_content_title.msg.text_empty'), type: "error" })
      }
      if(isLabelDuplicate()) {
        tempErrors[FORM_OPTIONS.ADD_LABEL].push({ text: t('form.embedded_content_title.msg.text_unique'), type: "error" })
      }
    }
    
    setFormErrors(tempErrors)
  }

  const handleOptionChange = (option) => {
    setActiveOption(option)

    if (option === FORM_OPTIONS.ADD_LABEL) {
      setMarkAsReviewed(false)
    } else if (option === FORM_OPTIONS.MARK_AS_REVIEWED) {
      setMarkAsReviewed(true)
    }
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  const isLabelDuplicate = () => {
    // in the case of aria_*_label_unique, messageArgs (from metadata) should have the offending label (at the first index)
    // i guess we could get it from the aria-label itself as well...
    const issue = activeIssue
    const metadata = issue.metadata ? JSON.parse(issue.metadata) : {}
    const labelFromMessageArgs = metadata.messageArgs ? metadata.messageArgs[0] : null
    const currentText = textInputValue.trim().toLowerCase()
    if (labelFromMessageArgs && currentText === labelFromMessageArgs) {
      return true
    }
    return false
  }
  
  return (
    <>
      {/* OPTION 1: Add label. ID: "add-label" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_LABEL ? 'selected' : ''}`}>
        <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
          <input
            type="radio"
            id={FORM_OPTIONS.ADD_LABEL}
            name="ufixitRadioOption"
            tabIndex="0"
            checked={activeOption === FORM_OPTIONS.ADD_LABEL}
            disabled={isDisabled}
            onChange={() => {
              handleOptionChange(FORM_OPTIONS.ADD_LABEL)
            }} />
          {t('form.embedded_content_title.label.text')}
        </label>
        {activeOption === FORM_OPTIONS.ADD_LABEL && (
          <>
            <input
              type="text"
              tabIndex="0"
              id="labelInputValue"
              name="labelInputValue"
              className="w-100"
              value={textInputValue}
              disabled={isDisabled}
              onChange={handleInput} />
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.ADD_LABEL]} />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Reviewed. ID: "mark-as-reviewed" */}
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