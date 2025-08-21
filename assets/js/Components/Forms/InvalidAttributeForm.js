import React, { useState, useEffect } from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function InvalidAttributeForm ({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed
 }) {

  // If you have any arbitrary limits or rules for tests, put them here at the top.
  const maxTextLength = 150

  const [textInputValue, setTextInputValue] = useState('')
  const [isToggleChecked, setIsToggleChecked] = useState(false)

  const [formErrors, setFormErrors] = useState([])


  // When a new active issue is set, update the form with the issue's relevant data.
  useEffect(() => {
    if (!activeIssue) {
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    let exampleTitleAttribute = Html.getAttribute(html, 'title') || ''

    setTextInputValue(exampleTitleAttribute)
    setIsToggleChecked(exampleTitleAttribute !== '')

    checkFormErrors()
  }, [activeIssue])


  // Whenever ANY valid input changes, check for errors and update the issue's HTML.
  // If additional variables are added, they must be included in the dependency array.
  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, isToggleChecked, markAsReviewed])


  // In order to get the new HTML to update in the preview pane, we have to send it back
  // to the parent component via the handleActiveIssue function.
  // We also must set a flag (isModified) so we know the issue has been changed.
  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

    if (markAsReviewed) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    // The easiest way to manipulate the HTML is to convert it to an element.
    // From there, we can update attributes and values.
    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    
    if (isToggleChecked) {
      element = Html.setAttribute(element, "role", "presentation")
      element = Html.setAttribute(element, 'alt', '')
      element = Html.setAttribute(element, 'title', '')
    } else {
      element = Html.removeAttribute(element, "role")
      element = Html.setAttribute(element, "alt", textInputValue)
      element = Html.setAttribute(element, "title", textInputValue)
    }

    // Convert back to a string and sent it on its way!
    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
  }


  // Whenever the input changes, and on initial load, we need to check for errors.
  // These errors are sent to the FormSaveOrReview component to be displayed to the user.
  const checkFormErrors = () => {
    let tempErrors = []
    
    // If the "No Changes Needed" checkbox is checked, we don't need to check for input errors
    if (!markAsReviewed) {
      if(Text.isTextEmpty(textInputValue)){
        tempErrors.push({ text: t('form.template_save.msg.text_empty'), type: 'error' })
      }
      if(Text.isTextTooLong(textInputValue, maxTextLength)){
        tempErrors.push({ text: t('form.template_save.msg.text_too_long'), type: 'error' })
      }
      // Make any other checks you have their own custom functions and error messages.
      if(!isSufficient()) {
        tempErrors.push({ text: t('form.template_save.msg.text_is_not_sufficient'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }


  const isSufficient = () => {
    // This is a placeholder for any custom logic you want to implement.
    // You may need to compare multiple values or check against a set of rules.
    return true
  }


  const handleSubmit = () => {
    if (markAsReviewed || formErrors.length === 0) {
      handleIssueSave(activeIssue)
    }
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  const handleCheckbox = () => {
    setIsToggleChecked(!isToggleChecked)
  }

  return (
    <>
      <label htmlFor="templateInput" className="instructions">{t('form.template_save.label.text')}</label>
      <div className="w-100 mt-2">
        <input
          type="text"
          tabIndex="0"
          id="templateInput"
          name="templateInput"
          className="w-100"
          value={textInputValue}
          disabled={isDisabled || isToggleChecked}
          onChange={handleInput} />
      </div>
      <div className="separator mt-2">{t('fix.label.or')}</div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input
          type="checkbox"
          id="templateCheckbox"
          name="templateCheckbox"
          tabIndex="0"
          disabled={isDisabled}
          checked={isToggleChecked}
          onChange={handleCheckbox} />
        <label htmlFor="templateCheckbox" className="instructions">{t('form.template_save.label.mark_decorative')}</label>
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