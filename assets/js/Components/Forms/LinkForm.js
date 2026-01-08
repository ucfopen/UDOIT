import React, { useState, useEffect } from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'

export default function LinkForm({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleIssueSave,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed
}) {

  const [textInputValue, setTextInputValue] = useState("")
  const [formErrors, setFormErrors] = useState([])
  const [deleteLink, setDeleteLink] = useState(false)

  useEffect(() => {
    let redirectLink = activeIssue.metadata
    if (redirectLink) {
      redirectLink = JSON.parse(redirectLink)
      redirectLink = redirectLink["redirect_url"]
    }
    const html = Html.getIssueHtml(activeIssue)
    setTextInputValue(redirectLink ? redirectLink : "")
    setFormErrors([])
    setDeleteLink(!activeIssue.newHtml && (activeIssue.status === 1))
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, deleteLink, markAsReviewed])

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
    if(!deleteLink) {
      if (Text.isTextEmpty(textInputValue)) {
        tempErrors.push([{text: t('form.link.msg.link_empty'), type: 'error'}])
      }
    }
    setFormErrors(tempErrors)
  }

  const handleSubmit = () => {
    if (markAsReviewed || formErrors.length === 0) {
      handleIssueSave(issue)
    }
  }

  const handleInput = (event, value) => {
    setTextInputValue(value)
  }

  const handleDeleteCheckbox = (event, value) => {
    setDeleteLink(event.target.checked)
    let issue = activeIssue
    issue.newHtml = processHtml()
    handleActiveIssue(issue)
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
      <input
        className="w-100 mt-0 mb-1"
        type="text"
        value={textInputValue}
        onChange={handleInput}
        tabIndex="0"
        disabled={isDisabled || deleteLink} />
      { formErrors.length > 0 && (
        <div className="error-message flex-column gap-1">
          {formErrors.map((error, index) => (
            <div key={index} className="error-text">{error.text}</div>
          ))}
        </div>
      )}
      <div className="flex-row gap-2 mb-3">
        <input
          type="checkbox"
          name="deleteLinkCheckbox"
          id="deleteLinkCheckbox"
          checked={deleteLink}
          tabIndex="0"
          disabled={isDisabled}
          onChange={handleDeleteCheckbox} />
        <label htmlFor="deleteLinkCheckbox">{t('form.anchor.delete_link')}</label>
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