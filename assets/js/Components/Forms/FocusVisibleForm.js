import React, { useState, useEffect } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import * as Html from '../../Services/Html'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function FocusVisibleForm({
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
    REMOVE_STYLES: UFIXIT_OPTIONS.DELETE_ATTRIBUTE,
    REPLACE_BACKGROUND: UFIXIT_OPTIONS.ADD_EMPHASIS
  };

  const parseStyle = (element) => {
    if (!element || !element.style) {
      return [];
    }
    // This ensures proper formatting and that malformed styles aren't used.
    let rawArray = element.style?.cssText?.split(";");
    let elementStyles = {};
    let hasOutlineStyle = false;
    let hasBackgroundColorStyle = false;

    for(const rawString of rawArray) {
      let splitString = rawString.split(":");
      if (splitString.length === 2) {
        let rawAttribute = splitString[0].trim();
        let rawValue = splitString[1].trim();
        if (rawAttribute.startsWith("border") || splitString[0].startsWith("outline")) {
          hasOutlineStyle = true;
        }
        else if (rawAttribute.startsWith("background-color")) {
          hasBackgroundColorStyle = true;
        }
        elementStyles[rawAttribute] = rawValue;
      }
    }

    return { 
      elementStyles: elementStyles,
      hasOutlineStyle: hasOutlineStyle,
      hasBackgroundColorStyle: hasBackgroundColorStyle
    };
  }

  useEffect(() => {
    if(!activeIssue) {
      return
    }

    const html = Html.getIssueHtml(activeIssue);
    const element = Html.toElement(html);
    const { elementStyles, hasOutlineStyle, hasBackgroundColorStyle } = parseStyle(element);

    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3);
    let startingOption = '';

    if (fixed && !hasOutlineStyle) {
      startingOption = FORM_OPTIONS.REMOVE_STYLES;
      if ( hasBackgroundColorStyle ) {
        startingOption = FORM_OPTIONS.REPLACE_BACKGROUND;
      }
    }
    setActiveOption(startingOption)

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption])

  const updateHtmlContent = () => {
    let issue = activeIssue;

    let element = Html.toElement(issue.initialHtml);

    if (activeOption === FORM_OPTIONS.REMOVE_STYLES || activeOption === FORM_OPTIONS.REPLACE_BACKGROUND) {
      
      const backgroundStyle = "background-color: rgba(128, 128, 128, 0.25);";
      const { elementStyles } = parseStyle(element);

      let newStyleString = '';

      for( const key of Object.keys(elementStyles) ) {
        if ( !key.startsWith("border") && !key.startsWith("outline")) {
          newStyleString += key + ": " + elementStyles[key] + ";";
        }
      }

      // If the user previously saved as "Replace Background" but wants to
      // resave without it, we need to be able to remove JUST our background.
      if (activeOption === FORM_OPTIONS.REPLACE_BACKGROUND) {
        newStyleString += backgroundStyle;
      }
      else {
        newStyleString = newStyleString.replace(backgroundStyle, "");
      }

      Html.setAttribute(element, "style", newStyleString);
      issue.newHtml = Html.toString(element);
      handleActiveIssue(issue);
      return
    }

    issue.newHtml = Html.toString(element);
    handleActiveIssue(issue);
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.REMOVE_STYLES]: [],
      [FORM_OPTIONS.REPLACE_BACKGROUND]: [],
    }
    setFormErrors(tempErrors)
  }

  return (
    <>
      {/* OPTION 1: Remove border and outline styles. ID: "REMOVE_STYLES" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.REMOVE_STYLES ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.REMOVE_STYLES}
          labelText = {t('form.focus_visible.decision.remove')}
        />
      </div>

      {/* OPTION 2: Replace borders and outlines with a background color. ID: "REPLACE_BACKGROUND" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.REPLACE_BACKGROUND ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.REPLACE_BACKGROUND}
          labelText = {t('form.focus_visible.decision.replace')}
        />
      </div>
    </>
  )
}