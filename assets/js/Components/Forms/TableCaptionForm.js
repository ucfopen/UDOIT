import React, {useState, useEffect} from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function TableCaptionForm({
  t,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
 }) {
  
  const FORM_OPTIONS = {
    ADD_TEXT: UFIXIT_OPTIONS.ADD_TEXT,
    DELETE_ELEMENT: UFIXIT_OPTIONS.DELETE_ELEMENT
  }

  const [textInputValue, setTextInputValue] = useState('')

  useEffect(() => {
    if(!activeIssue){
      return
    }
    
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    const initialText = (element ? element.innerText : '')
    setTextInputValue(initialText)
    setFormErrors([])

    const fixed = activeIssue.status > 0;
    const deleted = !activeIssue.newHtml
    let startingOption = ''

    if (fixed) {
      if (deleted) {
        startingOption = FORM_OPTIONS.DELETE_ELEMENT
      }
      else if (initialText !== '') {
        startingOption = FORM_OPTIONS.ADD_TEXT
      }
    }
    setActiveOption(startingOption)

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, textInputValue])

  const updateHtmlContent = () => {
    let issue = activeIssue

    if (activeOption === FORM_OPTIONS.DELETE_ELEMENT) {
      issue.newHtml = '';
    }
    else if (activeOption === FORM_OPTIONS.ADD_TEXT) {
      const html = Html.getIssueHtml(issue)
      let element = Html.toElement(html)
      issue.newHtml = Html.toString(Html.setInnerText(element, textInputValue))
    }

    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_TEXT]: [],
      [FORM_OPTIONS.DELETE_ELEMENT]: [],
    }

    if(activeOption === FORM_OPTIONS.ADD_TEXT) {
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.table_caption.msg.text_empty'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const handleInput = (event) => {
    const value = event.target.value
    setTextInputValue(value)
  }

  return (
    <>
      {/* OPTION 1: Add descriptive caption. ID: "ADD_TEXT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_TEXT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_TEXT}
          labelId = 'add-text-label'
          labelText = {t('form.table_caption.label.text')}
          />

        {activeOption === FORM_OPTIONS.ADD_TEXT && (
          <>
            <input
              aria-labelledby="add-text-label"
              name="linkTextInput"
              id="linkTextInput"
              className="w-100"
              type="text"
              value={textInputValue}
              onChange={handleInput}
              tabIndex="0"
              disabled={isDisabled}
            />
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]}
            />
          </>
        )}
      </div>

      {/* OPTION 2: Delete Caption. ID: "DELETE_ELEMENT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_ELEMENT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.DELETE_ELEMENT}
          labelText = {t('form.table_caption.label.remove_caption')}
        />
      </div>
    </>
  )
}