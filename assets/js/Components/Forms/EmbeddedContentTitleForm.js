import React, { useEffect, useState } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function EmbeddedContentTitleForm({
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
    ADD_LABEL: UFIXIT_OPTIONS.ADD_TEXT,
    MARK_DECORATIVE: UFIXIT_OPTIONS.MARK_DECORATIVE
  }

  const [textInputValue, setTextInputValue] = useState("")

  useEffect(() => {
    if (!activeIssue) {
      return;
    }
    const html = Html.getIssueHtml(activeIssue);
    const element = Html.toElement(html);
    const initialText = Html.getAccessibleName(element);
    setTextInputValue(initialText);

    const fixed = activeIssue.newHtml && activeIssue.status > 0;
    let startingOption = '';

    if (fixed) {
      if(initialText !== '') {
        startingOption = FORM_OPTIONS.ADD_LABEL;
      }
      else {
        startingOption = FORM_OPTIONS.MARK_DECORATIVE;
      }
    }
    setActiveOption(startingOption);

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, textInputValue])

  const updateHtmlContent = () => {

    let issue = activeIssue;
    let html = Html.getIssueHtml(activeIssue);
    let updatedElement = Html.toElement(html);

    if (activeOption === FORM_OPTIONS.ADD_LABEL) {
      Html.removeAttribute(updatedElement, "role", "presentation");
      Html.removeAttribute(updatedElement, "role", "none");
      Html.removeClass(updatedElement, issue.ignoreClass);
      Html.setAttribute(updatedElement, "aria-label", textInputValue);
      if (activeIssue.scanRuleId == 'media_alt_exists') {
        Html.setAttribute(updatedElement, "label", textInputValue);
      }
      else {
        Html.setAttribute(updatedElement, "title", textInputValue);
      }
    }

    if (activeOption === FORM_OPTIONS.MARK_DECORATIVE) {
      Html.removeAttribute(updatedElement, "aria-labelledby");
      Html.removeAttribute(updatedElement, "aria-label");
      Html.removeAttribute(updatedElement, "label");
      Html.removeAttribute(updatedElement, "title");
      Html.addClass(updatedElement, issue.ignoreClass);
      Html.setAttribute(updatedElement, "role", "presentation");
    }

    issue.newHtml = Html.toString(updatedElement);
    handleActiveIssue(issue);
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_LABEL]: []
    }
    
    if(activeOption === FORM_OPTIONS.ADD_LABEL) {
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_LABEL].push({ text: t('form.embedded_content_title.msg.text_empty'), type: "error" })
      }
      if(isLabelDuplicate()) {
        tempErrors[FORM_OPTIONS.ADD_LABEL].push({ text: t('form.embedded_content_title.msg.text_unique'), type: "error" })
      }
    }
    
    setFormErrors(tempErrors)
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  const isLabelDuplicate = () => {
    // in the case of aria_*_label_unique, messageArgs (from metadata) should have the offending label (at the first index)
    // i guess we could get it from the aria-label itself as well...
    const issue = activeIssue
    const metadata = issue.metadata ? JSON.parse(issue.metadata) : {}
    const labelFromMessageArgs = metadata.messageArgs ? metadata.messageArgs[0] : null
    const currentText = textInputValue.trim().toLowerCase()
    if (labelFromMessageArgs && currentText === labelFromMessageArgs) {
      return true
    }
    return false
  }
  
  return (
    <>
      {/* OPTION 1: Add label. ID: "ADD_LABEL" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_LABEL ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_LABEL}
          labelId = 'add-label-label'
          labelText = {t('form.embedded_content_title.decision.interactive')}
        />
        {activeOption === FORM_OPTIONS.ADD_LABEL && (
          <>
            <label htmlFor="labelInputValue">{t('form.embedded_content_title.label.text')}</label>
            <input
              aria-labelledby="add-label-label"
              type="text"
              tabIndex="0"
              id="labelInputValue"
              name="labelInputValue"
              className="w-100"
              value={textInputValue}
              disabled={isDisabled}
              onChange={handleInput}
            />
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.ADD_LABEL]}
            />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Decorative. ID: "MARK_DECORATIVE" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_DECORATIVE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_DECORATIVE}
          labelText = {t('form.embedded_content_title.decision.decorative')}
        />
      </div>
    </>
  )
}