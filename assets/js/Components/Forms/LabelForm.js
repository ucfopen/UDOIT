import React, { useEffect, useState } from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function LabelForm({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed
 }) {

  const [textInputValue, setTextInputValue] = useState('')
  const [formErrors, setFormErrors] = useState([])

  useEffect(() => {
    let html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    let initialText = Html.getAccessibleName(element)

    setTextInputValue(initialText)
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, markAsReviewed])

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

    updatedElement = Html.setAttribute(updatedElement, "aria-label", textInputValue)
    updatedElement = Html.setAttribute(updatedElement, "title", textInputValue)
    
    issue.newHtml = Html.toString(updatedElement)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = []
    
    if(Text.isTextEmpty(textInputValue)) {
      tempErrors.push({ text: t('form.label.msg.text_empty'), type: "error" })
    }
    if(isLabelDuplicate()) {
      tempErrors.push({ text: t('form.label.msg.text_unique'), type: "error" })
    }
    setFormErrors(tempErrors)
  }

  const handleSubmit = () => {
    handleIssueSave(activeIssue)
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
    const text = textInputValue.trim().toLowerCase()

    if (labelFromMessageArgs) {
      if (text == labelFromMessageArgs) {
        return true
      }
    }
    return false
  }
  
  return (
    <>
      <label htmlFor="labelInputValue" className="instructions">{t('form.label.label.text')}</label>
      <div className="w-100 mt-2">
        <input
          type="text" 
          id="labelInputValue"
          name="labelInputValue"
          className="w-100"
          value={textInputValue}
          disabled={isDisabled}
          tabIndex="0"
          onChange={handleInput} />
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