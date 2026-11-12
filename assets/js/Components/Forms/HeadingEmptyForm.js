import React, {useState, useEffect} from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function HeadingEmptyForm({
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
    DELETE_HEADING: UFIXIT_OPTIONS.DELETE_ELEMENT,
    REPLACE_WITH_PARAGRAPH: UFIXIT_OPTIONS.SELECT_TAG
  }

  const [textInputValue, setTextInputValue] = useState('')

  useEffect(() => {
    if (!activeIssue) {
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    const initialText = (element ? element.innerText : '')
    setTextInputValue(initialText)

    const fixed = activeIssue.newHtml && activeIssue.status > 0;
    const deleted = !activeIssue.newHtml
    const headingReplaced = element?.tagName?.toLowerCase() === 'p';
    let startingOption = ''

    if (fixed) {
      if (deleted) {
        startingOption = FORM_OPTIONS.DELETE_HEADING
      }
      else if (headingReplaced) {
        startingOption = FORM_OPTIONS.REPLACE_WITH_PARAGRAPH
      }
      else if (initialText !== '') {
        startingOption = FORM_OPTIONS.ADD_TEXT
      }
    }
    handleOptionChange(startingOption)
    setFormErrors([])
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue])

  const handleOptionChange = (option) => {
    updateHtmlContent(option)
    checkFormErrors(option)
    setActiveOption(option)
  }

  const updateHtmlContent = (optionOverride = activeOption) => {
    let issue = activeIssue
    let baseHtml = issue.sourceHtml;

    if (optionOverride === FORM_OPTIONS.DELETE_HEADING) {
      issue.newHtml = ''
    } 
    else if (optionOverride === FORM_OPTIONS.REPLACE_WITH_PARAGRAPH) {
      issue.newHtml = '<p>&nbsp;</p>'
    }
    else {
      issue.newHtml = Html.toString(Html.setInnerText(baseHtml, textInputValue))
    }

    handleActiveIssue(issue, optionOverride)
  }

  const checkFormErrors = (optionOverride = activeOption) => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_TEXT]: [],
      [FORM_OPTIONS.DELETE_HEADING]: [],
      [FORM_OPTIONS.REPLACE_WITH_PARAGRAPH]: [],
    }
    
    if (optionOverride === FORM_OPTIONS.ADD_TEXT) {
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.heading_empty.msg.text_empty'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  return (
    <>
      {/* OPTION 1: Replace with an empty paragraph. ID: "REPLACE_WITH_PARAGRAPH" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.REPLACE_WITH_PARAGRAPH ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={handleOptionChange}
          option={FORM_OPTIONS.REPLACE_WITH_PARAGRAPH}
          labelText = {t('form.heading_empty.decision.replace')}
        />
        {activeOption === FORM_OPTIONS.REPLACE_WITH_PARAGRAPH && (
          <OptionFeedback
            t={t}
            feedbackArray={formErrors[FORM_OPTIONS.REPLACE_WITH_PARAGRAPH]}
          />
        )}
      </div>

      {/* OPTION 2: Add text. ID: "ADD_TEXT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_TEXT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={handleOptionChange}
          option={FORM_OPTIONS.ADD_TEXT}
          labelId = 'add-text-label'
          labelText = {t('form.heading_empty.decision.text')}
        />
        {activeOption === FORM_OPTIONS.ADD_TEXT && (
          <>
          <label>
            <div className="">{t('form.heading_empty.label.text')}</div>
            <input
              className="w-100"
              type="text"
              value={textInputValue}
              onChange={handleInput}
              tabIndex="0"
              disabled={isDisabled}
            />
          </label>
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]}
            />
          </>
        )}
      </div>

      {/* OPTION 3: Delete Heading. ID: "DELETE_HEADING" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_HEADING ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={handleOptionChange}
          option={FORM_OPTIONS.DELETE_HEADING}
          labelText = {t('form.heading_empty.decision.delete')}
        />
        {activeOption === FORM_OPTIONS.DELETE_HEADING && (
          <OptionFeedback
            t={t}
            feedbackArray={formErrors[FORM_OPTIONS.DELETE_HEADING]}
          />
        )}
      </div>
    </>
  )
}
