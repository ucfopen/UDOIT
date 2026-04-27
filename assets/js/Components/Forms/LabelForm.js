import React, { useEffect, useState } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import { formNames, formNameFromRule } from '../../Services/Ufixit'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function LabelForm({
  t,
  settings,
  activeIssue,
  activeContentItem,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
 }) {
  
  const FORM_OPTIONS = {
    ADD_TEXT: settings.UFIXIT_OPTIONS.ADD_TEXT,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }
  const [textInputValue, setTextInputValue] = useState('')
  const [usedLabels, setUsedLabels] = useState([])

  useEffect(() => {
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    const initialText = Html.getAccessibleName(element)
    setTextInputValue(initialText)
  
    let tempUsedLabels = []
    let mustBeUnique = formNameFromRule(activeIssue?.scanRuleId) === formNames.LABEL_UNIQUE
    if(mustBeUnique && activeContentItem?.body) {
      // Get all of the landmark regions that require unique labels, and get their accesible names.
      // Query Selector list from Equal Access: https://github.com/IBMa/equal-access/blob/main-4.x/accessibility-checker-engine/src/v4/util/AriaUtil.ts#L1438C29-L1440C10
      const contentItemDoc = new DOMParser().parseFromString(activeContentItem?.body, 'text/html')
      const landmarkElements = contentItemDoc.querySelectorAll(
        'aside, [role="complementary"], ' +
        'footer, [role="contentinfo"], ' +
        'header, [role="banner"], ' +
        'main, [role="main"], ' +
        'nav, [role="navigation"], ' + 
        'form, [role="form"], ' +
        'section, [role="region"], ' +
        'article, [role="article"], ' +
        '[role="application"], [role="document"], [role="search"]'
      )
      
      // Add labels UNLESS they are from the current active element's path.
      for(let i = 0; i < landmarkElements.length; i++) {
        let tempXpath = Html.findXpathFromElement(landmarkElements[i])
        if (tempXpath !== activeIssue?.xpath) {
          let tempLabel = Html.getAccessibleName(landmarkElements[i], contentItemDoc)
          if (tempLabel) {
            tempUsedLabels.push(tempLabel.trim().toLowerCase())
          }
        }
      }
    }
    setUsedLabels(tempUsedLabels)
    
    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3)
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)
    let startingOption = ''

    if (reviewed) {
      startingOption = FORM_OPTIONS.MARK_AS_REVIEWED
    }
    if (fixed) {
      if (initialText !== ''){
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

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    let html = Html.getIssueHtml(activeIssue)
    let updatedElement = Html.toElement(html)

    updatedElement = Html.setAttribute(updatedElement, "aria-label", textInputValue)
    updatedElement = Html.setAttribute(updatedElement, "title", textInputValue)
    
    issue.newHtml = Html.toString(updatedElement)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_TEXT]: []
    }
    
    if(activeOption === FORM_OPTIONS.ADD_TEXT) {
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.label.msg.text_empty'), type: "error" })
      }
      if(isLabelDuplicate()) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.label.msg.text_unique'), type: "error" })
      }
    }
    setFormErrors(tempErrors)
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  const isLabelDuplicate = () => {
    const text = textInputValue.trim().toLowerCase()
    for(let i = 0; i < usedLabels.length; i++) {
      if(text === usedLabels[i]) {
        return true
      }
    }
    return false
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
          labelText = {t('form.label.label.text')}
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

      {/* OPTION 2: Mark as Reviewed. ID: "MARK_AS_REVIEWED" */}
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