import React, {useState, useEffect} from 'react'
import * as Html from '../../Services/Html'

export default function AnchorText({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  addMessage,
  handleActiveIssue,
}) {
  const maxLength = 150

  const [textInputValue, setTextInputValue] = useState("")
  const [textInputErrors, setTextInputErrors] = useState([])
  const [deleteLink, setDeleteLink] = useState(false)

  useEffect(() => {
    const html = Html.getIssueHtml(activeIssue)
    const initialText = Html.getInnerText(html)
    setTextInputValue(initialText)
    textHasErrors(initialText)
    setDeleteLink(!activeIssue.newHtml && (activeIssue.status === 1))
  }, [activeIssue])

  useEffect(() => {
    if (deleteLink) {
      setTextInputErrors([])
    }
    else {
      textHasErrors(textInputValue)
    }
  }, [textInputValue, deleteLink])

  const handleSubmit = () => {
    if(!deleteLink && textInputErrors.length > 0) {
      return
    }
    let issue = activeIssue
    issue.newHtml = processHtml()
    handleIssueSave(issue)
  }

  const textHasErrors = (newText) => {
    let textErrors = []
    if(!isTextDescriptive(newText)) {
      textErrors.push({ text: t('form.anchor.msg.text_descriptive'), type: 'error' })
    }
    if(!isTextNotEmpty(newText)) {
      textErrors.push({text: t('form.anchor.msg.text_empty'), type: 'error'})
    }
    setTextInputErrors(textErrors)
    if(textErrors.length > 0) {
      return true
    }
    return false
  }

  const isTextDescriptive = (value) => {
    const text = value.trim().toLowerCase()
    const badOptions = [
      'click',
      'click here',
      'more',
      'here',
    ]
    if (badOptions.includes(text)) {
      return false
    }
    return true
  }

  const isTextNotEmpty = (value) => {
    const text = value.trim().toLowerCase()
    if (text === '') {
      return false
    }
    return true
  }

  const handleInput = (event) => {
    const value = event.target.value
    setTextInputValue(value)

    let issue = activeIssue
    issue.newHtml = processHtml(value)
    handleActiveIssue(issue)
  }

  const handleDeleteCheckbox = (event) => {
    const checked = event.target.checked
    setDeleteLink(checked)
    let issue = activeIssue
    if(checked) {
      issue.newHtml = processHtml('')
    }
    else {
      issue.newHtml = processHtml(textInputValue)
    }
    handleActiveIssue(issue)
  }
  
  const processHtml = (innerText = null) => {
    const html = Html.getIssueHtml(activeIssue)
    if(innerText !== null) {
      return Html.toString(Html.setInnerText(html, innerText))
    }
    if(deleteLink) {
      return ''
    }
    return Html.toString(Html.setInnerText(html, textInputValue))
  }

  return (
    <>
      <label for="linkTextInput" className="mt-0 mb-2">{t('form.anchor.link_text')}</label>
      <input name="linkTextInput" id="linkTextInput" className="w-100 mt-2 mb-2" type="text" value={textInputValue} onChange={handleInput} disabled={deleteLink} />
      { textInputErrors.length > 0 && (
        <div className="error-message flex-column">
          {textInputErrors.map((error, index) => (
            <div key={index} className="error-text mb-2 flex-row justify-content-end">{error.text}</div>
          ))}
        </div>
      )}
      <div className="flex-row gap-1 mt-2 mb-3">
        <input type="checkbox" name="deleteLinkCheckbox" id="deleteLinkCheckbox" checked={deleteLink} onChange={handleDeleteCheckbox} />
        <label for="deleteLinkCheckbox">{t('form.anchor.delete_link')}</label>
      </div>
      <button className="btn btn-primary" onClick={handleSubmit} disabled={!deleteLink && textInputErrors.length > 0}>{t('form.submit')}</button>
    </>
  )
}