import React, {useState, useEffect} from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function HeadingEmptyForm({
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
  const [deleteHeader, setDeleteHeader] = useState(false)
  const [formErrors, setFormErrors] = useState([])

  useEffect(() => {
    if (activeIssue) {
      const html = Html.getIssueHtml(activeIssue)
      const element = Html.toElement(html)

      setTextInputValue(element ? element.innerText : '')
      setDeleteHeader(!element && activeIssue.status.toString() === '1')
    }
    setFormErrors([])
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, deleteHeader, markAsReviewed])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true 
    if (markAsReviewed) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    issue.newHtml = processHtml()
    handleActiveIssue(issue)
  }

  const processHtml = () => {
    if (deleteHeader) {
      return '';
    }

    const html = Html.getIssueHtml(activeIssue)
    return Html.toString(Html.setInnerText(html, textInputValue))
  }


  const checkFormErrors = () => {
    let tempErrors = []
    if(!deleteHeader) {
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors.push({ text: t('form.heading_empty.msg.text_empty'), type: 'error' })
      }
    }
    setFormErrors(tempErrors)
  }

  const handleCheckbox = () => {
    setDeleteHeader(!deleteHeader)
  }

  const handleInput = (newValue) => {
    setTextInputValue(newValue)
  }

  const handleSubmit = () => {
    if(markAsReviewed || formErrors.length === 0) {
      handleIssueSave(activeIssue)
    }
  }

  return (
    <>
      <label className="instructions" htmlFor="headingTextInput">{t('form.heading_empty.label.text')}</label>
      <div className="w-100 mt-2">
        <input
          type="text" 
          id="headingTextInput"
          name="headingTextInput"
          className="w-100"
          value={textInputValue}
          disabled={isDisabled || deleteHeader}
          tabIndex="0"
          onChange={(e) => handleInput(e.target.value)} />
      </div>
      <div className="separator mt-2">{t('fix.label.or')}</div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="deleteHeaderCheckbox"
          name="deleteHeaderCheckbox"
          checked={deleteHeader}
          tabIndex="0"
          disabled={isDisabled}
          onChange={handleCheckbox} />
        <label className="instructions" htmlFor="deleteHeaderCheckbox">{t('form.heading_empty.label.remove_header')}</label>
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