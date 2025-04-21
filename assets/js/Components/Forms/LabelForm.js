import React, { useEffect, useState } from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html'

export default function LabelForm({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  addMessage,
  handleActiveIssue,
  handleManualScan
 }) {

  const [textInputValue, setTextInputValue] = useState('')
  const [textInputErrors, setTextInputErrors] = useState([])
  const [ariaLabelExists, setAriaLabelExists] = useState(false)

  useEffect(() => {
    let html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    let initialText = Html.getAccessibleName(element)

    setTextInputValue(initialText)
  }, [activeIssue])

  useEffect(() => {
    checkFormErrors()
    handleHtmlUpdate()
  }, [textInputValue])


  const checkFormErrors = () => {
    let tempErrors = []
    
    tempErrors = checkTextNotEmpty(tempErrors)
    tempErrors = checkLabelIsUnique(tempErrors)
    
    setTextInputErrors(tempErrors)
  }

  const handleHtmlUpdate = () => {

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
    
    let issue = activeIssue
    issue.newHtml = Html.toString(updatedElement)
    handleActiveIssue(issue)
  }

  const handleSubmit = () => {
    if (textInputErrors.length > 0) {
      return
    }
    else {
      handleIssueSave(activeIssue)
    }
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  const checkTextNotEmpty = (errorArray) => {
    const text = textInputValue.trim().toLowerCase()
    if (text === '') {
      errorArray.push({ text: t('form.label.msg.text_empty'), type: "error" })
    }
    return errorArray
  }

  const checkLabelIsUnique = (errorArray) => {
    // in the case of aria_*_label_unique, messageArgs (from metadata) should have the offending label (at the first index)
    // i guess we could get it from the aria-label itself as well...
    const issue = activeIssue
    const metadata = issue.metadata ? JSON.parse(issue.metadata) : {}
    const labelFromMessageArgs = metadata.messageArgs ? metadata.messageArgs[0] : null
    const text = textInputValue.trim().toLowerCase()

    if (labelFromMessageArgs) {
      if (text == labelFromMessageArgs) {
        errorArray.push({ text: t('form.label.msg.text_unique'), type: "error" })
      }
    }
    return errorArray
  }
  
  return (
    <>
      <label htmlFor="labelInputValue">{t('form.label.label.text')}</label>
      <div className="w-100 mt-2">
        <input
          type="text" 
          id="labelInputValue"
          name="labelInputValue"
          className="w-100"
          value={textInputValue}
          onChange={handleInput} />
      </div>
      <FormFeedback issues={textInputErrors} />
      <div className="flex-row justify-content-start mt-3 mb-3">
        <button className="btn btn-primary" disabled={textInputErrors.length > 0} onClick={handleSubmit}>{t('form.submit')}</button>
      </div>
    </>
  )
}