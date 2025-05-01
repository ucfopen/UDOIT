import React, { useState, useEffect } from 'react'
import * as Html from '../../Services/Html'

export default function LinkForm({
  t,
  activeIssue,
  handleIssueSave,
  handleActiveIssue,
}) {

  const [textInputValue, setTextInputValue] = useState("")
  const [textInputErrors, setTextInputErrors] = useState([])
  const [deleteLink, setDeleteLink] = useState(false)

  useEffect(() => {
    let redirectLink = activeIssue.metadata
    if (redirectLink) {
      redirectLink = JSON.parse(redirectLink)
      redirectLink = redirectLink["redirect_url"]
    }
    const html = Html.getIssueHtml(activeIssue)
    setTextInputValue(redirectLink ? redirectLink : "")
    setTextInputErrors([])
    setDeleteLink(!activeIssue.newHtml && (activeIssue.status === 1))
  }, [activeIssue])

  useEffect(() => {
    checkFormErrors()
  }, [textInputValue, deleteLink])

  const checkFormErrors = () => {
    let tempErrors = []
    if(!deleteLink) {
      if (isLinkEmpty()) {
        tempErrors.push([{text: t('form.link.msg.link_empty'), type: 'error'}])
      }
    }
    setTextInputErrors(tempErrors)
  }

  const handleSubmit = () => {
    if (!deleteLink) {
      checkLinkNotEmpty()
    }

    if (textInputErrors.length > 0) {
      setTextInputErrors(textInputErrors)
    } else {
      let issue = activeIssue
      issue.newHtml = processHtml()
      handleIssueSave(issue)
    }
  }

  const handleInput = (event, value) => {
    setTextInputValue(value)
    checkLinkNotEmpty(value)
    let issue = activeIssue
    issue.newHtml = processHtml()
    handleActiveIssue(issue)
  }

  const handleDeleteCheckbox = (event, value) => {
    setDeleteLink(event.target.checked)
    let issue = activeIssue
    issue.newHtml = processHtml()
    handleActiveIssue(issue)
  }

  const isLinkEmpty = () => {
    const text = textInputValue.trim().toLowerCase()
    if (text === '') {
      return true
    }
    return false
  }

  const processHtml = () => {
    const html = Html.getIssueHtml(activeIssue)
    if (deleteLink) {
      return ''
    }
    return Html.toString(Html.prepareLink(Html.setAttribute(html, "href", textInputValue)))
  }

  return (
    <>
      <h3 className="mt-0 mb-2">{t('form.link.new_link')}</h3>
      <input className="w-100 mt-0 mb-1" type="text" value={textInputValue} onChange={handleInput} disabled={deleteLink} />
      { textInputErrors.length > 0 && (
        <div className="error-message flex-column gap-1">
          {textInputErrors.map((error, index) => (
            <div key={index} className="error-text">{error.text}</div>
          ))}
        </div>
      )}
      <div className="flex-row gap-2 mb-3">
        <input type="checkbox" name="deleteLinkCheckbox" id="deleteLinkCheckbox" checked={deleteLink} onChange={handleDeleteCheckbox} />
        <label for="deleteLinkCheckbox">{t('form.anchor.delete_link')}</label>
      </div>
      <button className="btn btn-primary" onClick={handleSubmit} disabled={textInputErrors.length > 0} >{t('form.submit')}</button>
    </>
  ) 
}