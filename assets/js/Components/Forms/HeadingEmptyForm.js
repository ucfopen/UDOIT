import React, {useState, useEffect} from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html'

export default function HeadingEmptyForm({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  addMessage,
  handleActiveIssue,
  handleManualScan
}) {

  const [textInputValue, setTextInputValue] = useState('')
  const [deleteHeader, setDeleteHeader] = useState(false)
  const [textInputErrors, setTextInputErrors] = useState([])

  useEffect(() => {
    if (activeIssue) {
      const html = Html.getIssueHtml(activeIssue)
      const element = Html.toElement(html)

      setTextInputValue(element ? element.innerText : '')
      setDeleteHeader(!element && activeIssue.status.toString() === '1')
    }
    setTextInputErrors([])
  }, [activeIssue])

  const isTextEmpty = () => {
    const text = textInputValue.trim().toLowerCase()
    if (text === '') {
      return true
    }
    return false
  }

  const processHtml = () => {
    if (deleteHeader) {
      return '';
    }

    const html = Html.getIssueHtml(activeIssue)
    return Html.toString(Html.setInnerText(html, textInputValue))
  }

  useEffect(() => {
    let tempErrors = []
    if(isTextEmpty()) {
      tempErrors.push({ text: t('form.heading_empty.msg.text_empty'), type: 'error' })
    }
    setTextInputErrors(tempErrors)

    let issue = activeIssue
    issue.newHtml = processHtml()
    handleActiveIssue(issue)
  }, [textInputValue, deleteHeader])

  const handleCheckbox = () => {
    setDeleteHeader(!deleteHeader)
  }

  const handleInput = (newValue) => {
    setTextInputValue(newValue)
  }

  const handleSubmit = () => {
    handleIssueSave(activeIssue)
  }

  return (
    <>
      <label htmlFor="headingTextInput">{t('form.heading_empty.label.text')}</label>
      <div className="w-100 mt-2">
        <input
          type="text" 
          id="headingTextInput"
          name="headingTextInput"
          className="w-100"
          value={textInputValue}
          disabled={deleteHeader}
          onChange={(e) => handleInput(e.target.value)} />
      </div>
      <FormFeedback issues={textInputErrors} />
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="deleteHeaderCheckbox"
          name="deleteHeaderCheckbox"
          checked={deleteHeader}
          onChange={handleCheckbox} />
        <label htmlFor="deleteHeaderCheckbox">{t('form.heading_empty.label.remove_header')}</label>
      </div>
      <div className="flex-row justify-content-start mt-3 mb-3">
        <button className="btn btn-primary" disabled={textInputErrors.length > 0} onClick={handleSubmit}>{t('form.submit')}</button>
      </div>
    </>
  )
}