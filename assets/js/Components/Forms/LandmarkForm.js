import React, { useEffect, useState } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'
import { LANDMARK_TAGS, LANDMARK_ROLES, UFIXIT_OPTIONS } from '../../Services/Constants'

export default function LandmarkForm({
  t,
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
    ADD_TEXT: UFIXIT_OPTIONS.ADD_TEXT,
    SELECT_TAG: UFIXIT_OPTIONS.SELECT_TAG
  };
  const [textInputValue, setTextInputValue] = useState('');
  const [usedLabels, setUsedLabels] = useState([]);

  useEffect(() => {
    const html = Html.getIssueHtml(activeIssue);
    const element = Html.toElement(html);
    const initialText = Html.getAccessibleName(element);
    setTextInputValue(initialText);

    let tempUsedLabels = [];

    if(activeContentItem?.body) {
      // Get all of the landmark regions that require unique labels, and get their accesible names.
      // Query Selector list from Equal Access: https://github.com/IBMa/equal-access/blob/main-4.x/accessibility-checker-engine/src/v4/util/AriaUtil.ts#L1438C29-L1440C10
      const contentItemDoc = new DOMParser().parseFromString(activeContentItem?.body, 'text/html');
      const landmarkTagList = LANDMARK_TAGS.join(', ');
      const landmarkRoleList = LANDMARK_ROLES.map(widgetRole => '[role="' + widgetRole + '"]').join(', ');
      const landmarkElements = contentItemDoc.querySelectorAll(
        landmarkTagList + landmarkRoleList
      );

      // Add labels UNLESS they are from the current active element's path.
      for(let i = 0; i < landmarkElements.length; i++) {
        let tempXpath = Html.findXpathFromElement(landmarkElements[i]);
        if (tempXpath !== activeIssue?.xpath) {
          let tempLabel = Html.getAccessibleName(landmarkElements[i], contentItemDoc);
          if (tempLabel && !tempUsedLabels.includes(tempLabel)) {
            tempUsedLabels.push(tempLabel.trim().toLowerCase());
          }
        }
      }
    }
    setUsedLabels(tempUsedLabels);
  
    const fixed = activeIssue.newHtml && activeIssue.status > 0;
    let startingOption = '';

    if (fixed) {
      const currentRole = Html.getAttribute(element, "role")?.toLowerCase();
      const hasLandmarkRole = LANDMARK_ROLES.includes(currentRole);

      const currentTag = Html.getTagName(element)?.toLowerCase();
      const hasLandmarkTag = LANDMARK_TAGS.includes(currentTag);

      if (hasLandmarkRole || hasLandmarkTag || initialText !== '') {
        startingOption = FORM_OPTIONS.ADD_TEXT;
      }
      else {
        startingOption = FORM_OPTIONS.SELECT_TAG;
      }
    }
    setActiveOption(startingOption);

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent();
    checkFormErrors();
  }, [activeOption, textInputValue]);

  const updateHtmlContent = () => {

    let issue = activeIssue;
    const html = issue.initialHtml;
    let element = Html.toElement(html);

    if (activeOption === FORM_OPTIONS.SELECT_TAG) {
      let currentRole = Html.getAttribute(element, "role")?.toLowerCase();
      if (LANDMARK_ROLES.includes(currentRole)) {
        Html.removeAttribute(element, "role");
      }
      let currentTag = Html.getTagName(element)?.toLowerCase();
      if (LANDMARK_TAGS.includes(currentTag)) {
        Html.renameElement(element, "div");
      }
      Html.removeAttribute(element, "aria-label");
      Html.removeAttribute(element, "title");
    }

    else if (activeOption === FORM_OPTIONS.ADD_TEXT) {
      Html.setAttribute(element, "aria-label", textInputValue);
      Html.setAttribute(element, "title", textInputValue);
    }

    issue.newHtml = Html.toString(element);
    handleActiveIssue(issue);
  };

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_TEXT]: []
    };
    
    if(activeOption === FORM_OPTIONS.ADD_TEXT) {
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.label.msg.text_empty'), type: "error" });
      }
      if(isLabelDuplicate()) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.label.msg.text_unique'), type: "error" });
      }
    }
    setFormErrors(tempErrors);
  };

  const handleInput = (event) => {
    setTextInputValue(event.target.value);
  };

  const isLabelDuplicate = () => {
    const text = textInputValue.trim().toLowerCase();
    for(let i = 0; i < usedLabels.length; i++) {
      if(text === usedLabels[i]) {
        return true;
      }
    }
    return false;
  };
  
  return (
    <>
     {/* OPTION 1: Add label. ID: "ADD_TEXT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_TEXT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_TEXT}
          labelText = {t('form.landmark.decision.landmark')}
        />
        {activeOption === FORM_OPTIONS.ADD_TEXT && (
          <>
            <label>
              <div>{t('form.landmark.label.landmark')}</div>
              <input
                className="w-100"
                type="text"
                value={textInputValue}
                onChange={handleInput}
                placeholder={t('form.landmark.label.landmark.placeholder')}
                disabled={isDisabled}
              />
            </label>
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]}
            />
            {(usedLabels.length > 0) && (
              <details className="mt-3">
                <summary id="summary-title">{t('form.landmark.label.existing')}</summary>
                <div className="text-block mt-3" aria-labelledby="summary-title">
                  <ul>
                    {usedLabels.map((usedLabel) => (
                      <li key={usedLabel.replaceAll(" ", "-")}>{usedLabel}</li>
                    ))}
                  </ul>
                </div>
              </details>
            )}
          </>
        )}
      </div>

      {/* OPTION 2: Remove landmark role or tag. ID: "SELECT_TAG" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.SELECT_TAG ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.SELECT_TAG}
          labelText = {t('form.landmark.decision.content')}
        />
      </div>
    </>
  )
}