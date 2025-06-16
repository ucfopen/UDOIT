import React, {useState, useEffect} from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html'

export default function TableCaptionForm({
  t,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
}) {

  const [textInputValue, setTextInputValue] = useState('')
  const [deleteCaption, setDeleteCaption] = useState(false)
  const [textInputErrors, setTextInputErrors] = useState([])

  useEffect(() => {
    if (activeIssue) {
      const html = Html.getIssueHtml(activeIssue)
      const element = Html.toElement(html)

      setTextInputValue(element ? element.innerText : '')
      setDeleteCaption(!element && activeIssue.status.toString() === '1')
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
    if (deleteCaption) {
      return '';
    }

    const html = Html.getIssueHtml(activeIssue)
    return Html.toString(Html.setInnerText(html, textInputValue))
  }

  useEffect(() => {
    let tempErrors = []
    if(!deleteCaption && isTextEmpty()) {
      tempErrors.push({ text: t('form.table_caption.msg.text_empty'), type: 'error' })
    }
    setTextInputErrors(tempErrors)

    let issue = activeIssue
    issue.newHtml = processHtml()
    handleActiveIssue(issue)
  }, [textInputValue, deleteCaption])

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
          tabindex="0"
          onChange={(e) => handleInput(e.target.value)} />
      </div>
      <div className="separator mt-2">{t('fix.label.or')}</div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="deleteCaptionCheckbox"
          name="deleteCaptionCheckbox"
          checked={deleteCaption}
          tabindex="0"
          disabled={isDisabled}
          onChange={handleCheckbox} />
        <label className="instructions" htmlFor="deleteCaptionCheckbox">{t('form.table_caption.label.remove_caption')}</label>
      </div>
      <div className="mt-1">
        <em>{t('form.table_caption.label.remove_caption_desc')}</em>
      </div>
      <FormFeedback
        t={t}
        isDisabled={isDisabled}
        handleSubmit={handleSubmit}
        formErrors={textInputErrors} />
    </>
  )
}