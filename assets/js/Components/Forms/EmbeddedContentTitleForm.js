import React, { useEffect, useState } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function EmbeddedContentTitleForm({
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
    ADD_LABEL: settings.UFIXIT_OPTIONS.ADD_TEXT,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  const [textInputValue, setTextInputValue] = useState("")

  useEffect(() => {
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    const initialText = Html.getAccessibleName(element)
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)

    if(reviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else if(initialText !== '') {
      setActiveOption(FORM_OPTIONS.ADD_LABEL)
    }
    else {
      setActiveOption('')
    }

    setTextInputValue(initialText)
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, textInputValue])

  const updateHtmlContent = () => {

    let issue = activeIssue
    issue.isModified = true

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
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
    
    if(activeOption === FORM_OPTIONS.ADD_LABEL) {
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_LABEL].push({ text: t('form.embedded_content_title.msg.text_empty'), type: "error" })
      }
      if(isLabelDuplicate()) {
        tempErrors[FORM_OPTIONS.ADD_LABEL].push({ text: t('form.embedded_content_title.msg.text_unique'), type: "error" })
      }
    }
    
    setFormErrors(tempErrors)
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
      {/* OPTION 1: Add label. ID: "ADD_LABEL" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_LABEL ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_LABEL}
          labelId = 'add-label-label'
          labelText = {t('form.embedded_content_title.label.text')}
          />
        {activeOption === FORM_OPTIONS.ADD_LABEL && (
          <>
            <input
              aria-labelledby="add-label-label"
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

      {/* OPTION 2: Mark as Reviewed. ID: "MARK_AS_REVIEWED" */}
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