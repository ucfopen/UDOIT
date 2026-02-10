import React, { useState, useEffect } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import Combobox from '../Widgets/Combobox'
import ToggleSwitch from '../Widgets/ToggleSwitch'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

// This template is built with the same structure as the LanguageForm if you want to see it in action.
// It allows three major types of fixes: selecting an option from a list, adding text, or using a checkbox.
// For the template, I've also added a demo toggle switch that shows up beneath the text input.

// This is an example of all of the most complicated form logic you might need to implement, especially with
// the Select Language dropdown using a Combobox component. Simpler forms will not need all of this logic.
// You can remove any parts that you don't need for your specific form. For a simplified example, see the
// HeadingEmptyForm.js component.

export default function TemplateSaveOrReviewForm ({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
 }) {
  
  // Define the major radio button level options for the form using settings constants. 
  const FORM_OPTIONS = {
    ADD_TEXT: settings.UFIXIT_OPTIONS.ADD_TEXT,
    SELECT_LANGUAGE: settings.UFIXIT_OPTIONS.SELECT_ATTRIBUTE_VALUE,
    DELETE_ATTRIBUTE: settings.UFIXIT_OPTIONS.DELETE_ATTRIBUTE,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  // If you have any arbitrary limits or rules for tests, put them here at the top.
  const maxTextLength = 150

  // Use local state for any variables that the user can change in the form.
  // You do NOT need to handle which radio option is selected here; that is handled in UfixitWidget.js
  // by calling the setActiveOption function.
  const [textInputValue, setTextInputValue] = useState('')
  const [selectOptions, setSelectOptions] = useState([])
  const [selectedValue, setSelectedValue] = useState('')
  const [isToggleChecked, setIsToggleChecked] = useState(false)
  
  const primaryLanguages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ru': 'Russian',
      'ar': 'Arabic',
      'hi': 'Hindi',
  }

  // When a new active issue is set, update the form with the issue's relevant data.
  useEffect(() => {
    if (!activeIssue) {
      return
    }

    const attributeName = 'lang'

    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    const hasAttribute = Html.hasAttribute(element, attributeName)
    const attributeValue = Html.getAttribute(element, attributeName) || ''
    const selectOptions = computeSelectOptions(attributeValue)
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)
    
    // Determine which option should be selected based on the issue's current state.
    if (!hasAttribute) {
      setActiveOption(FORM_OPTIONS.DELETE_ATTRIBUTE)
    }
    else if (reviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else if (attributeValue in primaryLanguages) {
      setActiveOption(FORM_OPTIONS.SELECT_LANGUAGE)
    }
    else if (attributeValue !== '') {
      setActiveOption(FORM_OPTIONS.ADD_TEXT)
    }
    else {
      setActiveOption('')
    }

    setSelectedValue(attributeValue)
    setSelectOptions(selectOptions)
    setTextInputValue(attributeValue)
    setIsToggleChecked(attributeValue === 'en-US') // Example logic for the toggle
  }, [activeIssue])


  // Whenever the activeOption (radio button) or any user input changes, check for errors and update the HTML.
  // If additional variables are added, they must be included in the dependency array.
  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, textInputValue, isToggleChecked, selectedValue])


  // In order to get the new HTML to update in the preview pane, we have to send it back
  // to the parent component via the handleActiveIssue function.
  // We also must set a flag (isModified) so we know the issue has been changed.
  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

    // The easiest way to manipulate the HTML is to convert it to an element.
    // Always start with the initialHtml to avoid compounding changes on top of each other.
    // Then make changes based on the activeOption (selected radio button).
    // Mark as Reviewed leaves the HTML unchanged, and needs no changes here (the class is added elsewhere).
    const element = Html.toElement(issue.initialHtml)

    if (activeOption === FORM_OPTIONS.ADD_TEXT) {
      element = Html.setAttribute(element, "lang", textInputValue)

      // Since in this example, there is a checkbox inside the "Add Text" option,
      // we can make more changes based on whether that is checked or not.
      if (isToggleChecked) {
        element = Html.setAttribute(element, "lang", "en-US")
      }
    }

    else if (activeOption === FORM_OPTIONS.SELECT_LANGUAGE) {
      element = Html.setAttribute(element, "lang", selectedValue)
    }

    else if (activeOption === FORM_OPTIONS.DELETE_ATTRIBUTE) {
      element = Html.removeAttribute(element, "lang")
    }

    // Convert back to a string and send it on its way!
    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
  }


  // Whenever the input changes, and on initial load, we need to check for errors.
  // These errors are sent to the FormSaveOrReview component to be displayed to the user.
  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.SELECT_LANGUAGE]: [],
      [FORM_OPTIONS.ADD_TEXT]: [],
      [FORM_OPTIONS.DELETE_ATTRIBUTE]: []
    }
    
    // Errors should be specific to the active option.
    if (activeOption === FORM_OPTIONS.ADD_TEXT) {
      if(Text.isTextEmpty(textInputValue)){
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.template_save.msg.text_empty'), type: 'error' })
      }
      if(Text.isTextTooLong(textInputValue, maxTextLength)){
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.template_save.msg.text_too_long'), type: 'error' })
      }
    }
    else if (activeOption === FORM_OPTIONS.SELECT_LANGUAGE) {
      // Make any other checks you have their own custom functions and error messages.
      if(!isSufficient()) {
        tempErrors[FORM_OPTIONS.SELECT_LANGUAGE].push({ text: t('form.template_save.msg.text_is_not_sufficient'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const isSufficient = () => {
    // This is a placeholder for any custom logic you want to implement.
    // You may need to compare multiple values or check against a set of rules.
    return true
  }

  // Returns an array of language options that is used by the combobox
  // selectedLang is a string that can either be an empty string or one of the abberiviated languages and indicates which language is selected
  const computeSelectOptions = (currentSelection) => {
    let tempOptions = []
    tempOptions.push({
      value: "",
      name: 'No Language Selected',
      selected: currentSelection === ''
    })
    for(const key in primaryLanguages){
      tempOptions.push({
        value: key,
        name: primaryLanguages[key],
        selected: currentSelection === key
      })
    }
    return tempOptions
  }

  const handleTextInput = (event) => {
    setTextInputValue(event.target.value)
  }

  const handleComboboxSelect = (selectedOption) => {
    setSelectedValue(selectedOption)

    // This recomputes the select options to update which one is marked as selected
    // That way if the user switches between options, the one they previously chose remains selected
    const tempSelectOptions = computeSelectOptions(selectedOption)
    setSelectOptions(tempSelectOptions)
  }

  return (
    <>
      {/* OPTION 1: Enter text with optional checkbox. ID: "ADD_TEXT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_TEXT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_TEXT}
          labelId = 'add-text-label'  // Make sure that the label has a unique ID for the input element!
          labelText = 'Type in the language you want to use'  // Use variables though, like {t(`form.language.label.useBCP`)}
          />

        {/* IF the option is selected, show the additional inputs, instructions, and error messages. */}
        {activeOption === FORM_OPTIONS.ADD_TEXT && (
          <>
            <input
              aria-labelledby="add-text-label"  // This should match the labelId above.
              type="text"
              tabIndex="0"
              id="altTextInput"
              name="altTextInput"
              className="w-100"
              value={textInputValue}
              disabled={isDisabled}
              onChange={handleTextInput} />
            
            {/* Example checkbox using the custom Toggle switch component */}
            <div className="flex-row justify-content-start gap-1">
              <ToggleSwitch
                labelId="exampleCheckbox"
                initialValue={isToggleChecked}
                updateToggle={setIsToggleChecked}
                disabled={isDisabled}
                small={true} />
              <label htmlFor="exampleCheckbox" className="ufixit-instructions">Ignore what I wrote and mark the language as English</label>
            </div>
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]} />
          </>
        )}
      </div>

      {/* OPTION 2: Select language. ID: "SELECT_LANGUAGE" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.SELECT_LANGUAGE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.SELECT_LANGUAGE}
          labelId = 'combo-label-language-select'
          labelText = {t(`form.language.label.select_language`)} 
          />
        {activeOption === FORM_OPTIONS.SELECT_LANGUAGE && (
          <>
            <Combobox 
              isDisabled={isDisabled} 
              handleChange={handleComboboxSelect} 
              id='language-select'
              label=''
              options={selectOptions} 
              settings={settings}
            />
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.SELECT_LANGUAGE]} />
          </>
        )}
      </div>

      {/* OPTION 3: Remove lang attribute. ID: "DELETE_ATTRIBUTE" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_ATTRIBUTE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.DELETE_ATTRIBUTE}
          labelText = 'Remove the lang attribute'
          />
      </div>

      {/* OPTION 4: Mark as Reviewed. ID: "mark-as-reviewed" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_AS_REVIEWED}
          labelText = {t('fix.label.no_changes')}
          />
      </div>
    </>
  )
}