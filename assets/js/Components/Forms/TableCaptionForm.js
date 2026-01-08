import React, {useState, useEffect} from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function TableCaptionForm({
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
  const [deleteCaption, setDeleteCaption] = useState(false)
  const [formErrors, setFormErrors] = useState([])

  useEffect(() => {
    if (activeIssue) {
      const html = Html.getIssueHtml(activeIssue)
      const element = Html.toElement(html)

      setTextInputValue(element ? element.innerText : '')
      setDeleteCaption(!element && activeIssue.status.toString() === '1')
    }
    setFormErrors([])
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, deleteCaption, markAsReviewed])

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

  const checkFormErrors = () => {
    let tempErrors = []
    if(!deleteCaption) {
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors.push({ text: t('form.table_caption.msg.text_empty'), type: 'error' })
      }
    }
    setFormErrors(tempErrors)
  }

  const processHtml = () => {
    if (deleteCaption) {
      return '';
    }

    const html = Html.getIssueHtml(activeIssue)
    return Html.toString(Html.setInnerText(html, textInputValue))
  }

  const handleCheckbox = () => {
    setDeleteCaption(!deleteCaption)
  }

  const handleInput = (newValue) => {
    setTextInputValue(newValue)
  }

  const handleSubmit = () => {
    handleIssueSave(activeIssue)
  }

  return (
    <>
      <label className="instructions" htmlFor="captionTextInput">{t('form.table_caption.label.text')}</label>
      <div className="w-100 mt-2">
        <input
          type="text" 
          id="captionTextInput"
          name="captionTextInput"
          className="w-100"
          value={textInputValue}
          disabled={isDisabled || deleteCaption}
          tabIndex="0"
          onChange={(e) => handleInput(e.target.value)} />
      </div>
      <div className="separator mt-2">{t('fix.label.or')}</div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="deleteCaptionCheckbox"
          name="deleteCaptionCheckbox"
          checked={deleteCaption}
          tabIndex="0"
          disabled={isDisabled}
          onChange={handleCheckbox} />
        <label className="instructions" htmlFor="deleteCaptionCheckbox">{t('form.table_caption.label.remove_caption')}</label>
      </div>
      <div className="instructions-helper">{t('form.table_caption.label.remove_caption_desc')}</div>
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