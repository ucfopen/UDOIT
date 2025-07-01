import React, { useState, useEffect } from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html'

export default function Template ({
  t,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
 }) {
  
  // Forms may have any number of inputs. In this example, we will have a text field,
  // a select dropdown, and a checkbox.
  const dropdownOptions = [
    { value: 'option1', label: t('form.template.dropdown.option1') },
    { value: 'option2', label: t('form.template.dropdown.option2') },
    { value: 'option3', label: t('form.template.dropdown.option3') },
  ]

  const [textInputValue, setTextInputValue] = useState('')
  const [numberInputValue, setNumberInputValue] = useState(0)
  const [selectedOption, setSelectedOption] = useState('')
  const [isChecked, setIsChecked] = useState(false)

  const [formErrors, setFormErrors] = useState([])

  // When the Active Issue changes, we will need to set the form's initial values
  useEffect(() => {
    if (activeIssue) {
      const html = Html.getIssueHtml(activeIssue)
      let altText = Html.getAttribute(html, 'alt')
      altText = (typeof altText === 'string') ? altText : ''

      setTextInputValue(altText)
      setIsChecked((elementIsDecorative(html) === 'true'))
      setCharacterCount(altText.length)
      setFormErrors([])
    }
  }, [activeIssue])

  // Whenever any of the form inputs change, we should update the form's errors
  useEffect(() => {
    updateActiveIssueHtml()
    checkFormErrors()
  }, [textInputValue, numberInputValue, selectedOption, isChecked])

  // This function updates the active issue's HTML based on the form inputs.
  // The handleActiveIssue function sends the new data to the parent component, which
  // then sends the updated html to the preview component for the live render.
  const updateActiveIssueHtml = () => {
    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    
    // In this example, is the checkbox is checked we will NOT include any alt text.
    if (isChecked) {
      element = Html.setAttribute(element, "role", "presentation")
      element = Html.setAttribute(element, 'alt', '')
    } else {
      element = Html.removeAttribute(element, "role")
      element = Html.setAttribute(element, "alt", textInputValue)
    }

    let issue = activeIssue
    issue.newHtml = Html.toString(element)

    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = []
    
    // In this example, if the checkbox is checked, we can ignore input errors
    if (!isChecked) {
      if(isTextEmpty()){
        tempErrors.push({ text: t('form.alt_text.msg.text_empty'), type: 'error' })
      }
      if(isTextTooLong()){
        tempErrors.push({ text: t('form.alt_text.msg.text_too_long'), type: 'error' })
      }
    }

    if(!selectedOption) {
      tempErrors.push({ text: t('form.template.msg.select_option'), type: 'error' })
    }

    setFormErrors(tempErrors)
  }

  const handleSubmit = () => {
    if (formErrors.length === 0) {
      handleIssueSave(activeIssue)
    }
  }

  const handleTextInput = (event) => {
    setTextInputValue(event.target.value)
  }

  const handleNumberInput = (event) => {
    const value = event.target.value
    // Ensure the number input is a valid number
    if (!isNaN(value) && value !== '') {
      setNumberInputValue(Number(value))
    } else {
      setNumberInputValue(0)
    }
  }

  const handleCheckbox = () => {
    setIsChecked(!isChecked)
  }

  const isTextEmpty = () => {
    const text = textInputValue.trim().toLowerCase()

    if (text === '') {
      return true
    }
    return false
  }

  const isTextTooLong = () => {
    const maxLength = 150
    const text = textInputValue.trim().toLowerCase()

    if (text.length > maxLength) {
      return true
    }
    return false
  }

  const elementIsDecorative = (htmlString) => {
    const decorativeAttribute = Html.getAttribute(htmlString, "data-decorative")
    const roleAttribute = Html.getAttribute(htmlString, "role")
    const classes = Html.getClasses(htmlString)

    if (Html.getTagName(htmlString) !== 'IMG') {
      return false
    }

    return (decorativeAttribute === 'true' || roleAttribute === 'presentation' || (classes.includes('phpally-ignore')))
  }

  return (
    <>
      <label htmlFor="altTextInput">{t('form.alt_text.label.text')}</label>
      <div className="w-100 mt-2">
        <input
          type="text"
          tabindex="0"
          id="altTextInput"
          name="altTextInput"
          className="w-100"
          value={textInputValue}
          disabled={isDisabled || isChecked}
          onChange={handleTextInput} />
      </div>
      <div className="flex-row justify-content-end mt-1">
        <div className="text-muted">
          {t('form.alt_text.feedback.characters', {current: characterCount, total: maxLength})}
        </div>
      </div>
      <label htmlFor="numericInput">{t('form.alt_text.label.number')}</label>
      <div className="w-100 mt-2">
        <input
          type="number"
          tabindex="0"
          id="numericInput"
          name="numericInput"
          className="w-100"
          value={numberInputValue}
          onChange={handleNumberInput} />
      </div>
      <div className="flex-row justify-content-start mt-2">
        <label htmlFor="selectOption">{t('form.template.label.select_option')}</label>
        <select
          id="selectOption"
          name="selectOption"
          className="w-100 mt-1"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          disabled={isDisabled}>
          <option value="" disabled>{t('form.template.label.select_placeholder')}</option>
          {dropdownOptions.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input
          type="checkbox"
          id="decorativeCheckbox"
          name="decorativeCheckbox"
          tabindex="0"
          disabled={isDisabled}
          checked={isChecked}
          onChange={handleCheckbox} />
        <label htmlFor="decorativeCheckbox">{t('form.alt_text.label.mark_decorative')}</label>
      </div>
      <FormFeedback
        t={t}
        isDisabled={isDisabled}
        handleSubmit={handleSubmit}
        formErrors={formErrors} />
    </>
  )
}