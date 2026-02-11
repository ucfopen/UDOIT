import React, {useState, useEffect} from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function HeadingEmptyForm({
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

  const FORM_OPTIONS = {
    ADD_TEXT: settings.UFIXIT_OPTIONS.ADD_TEXT,
    DELETE_HEADING: settings.UFIXIT_OPTIONS.DELETE_ELEMENT,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  const [textInputValue, setTextInputValue] = useState('')

  useEffect(() => {
    if (activeIssue) {
      const html = Html.getIssueHtml(activeIssue)
      const element = Html.toElement(html)

      const initialText = (element ? element.innerText : '')
      const deleted = (!activeIssue.newHtml && (activeIssue.status === 1))
      const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)

      if (deleted) {
        setActiveOption(FORM_OPTIONS.DELETE_HEADING)
      }
      else if (reviewed) {
        setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
      }
      else if (initialText !== '') {
        setActiveOption(FORM_OPTIONS.ADD_TEXT)
      }
      else {
        setActiveOption('')
      }

      setTextInputValue(initialText)
    }
    setFormErrors([])
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, textInputValue])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true 

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      issue.newHtml = issue.initialHtml
    }
    else if (activeOption === FORM_OPTIONS.DELETE_HEADING) {
      issue.newHtml = ''
    }
    else {
      const html = Html.getIssueHtml(activeIssue)
      issue.newHtml = Html.toString(Html.setInnerText(html, textInputValue))
    }

    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_TEXT]: [],
      [FORM_OPTIONS.DELETE_HEADING]: [],
    }
    
    if (activeOption === FORM_OPTIONS.ADD_TEXT) {
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
      {/* OPTION 1: Add text. ID: "ADD_TEXT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_TEXT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_TEXT}
          labelId = 'add-text-label'
          labelText = {t('form.heading_empty.label.text')}
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
              disabled={isDisabled} />
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]} />
          </>
        )}
      </div>
      
      {/* OPTION 2: Delete Heading. ID: "DELETE_HEADING" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_HEADING ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.DELETE_HEADING}
          labelText = {t('form.heading_empty.label.remove_heading')}
          />
        {activeOption === FORM_OPTIONS.DELETE_HEADING && (
          <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.DELETE_HEADING]} />
        )}
      </div>
      
      {/* OPTION 3: Mark as Reviewed. ID: "MARK_AS_REVIEWED" */}
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