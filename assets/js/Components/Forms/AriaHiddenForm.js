import React, { useState, useEffect } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import * as Html from '../../Services/Html'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function AriaHiddenForm({
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
    REMOVE_HIDDEN: UFIXIT_OPTIONS.DELETE_ATTRIBUTE,
    MARK_AS_REVIEWED: UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  useEffect(() => {
    if(!activeIssue) {
      return
    }

    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3);
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3);
    let startingOption = '';

    if (reviewed) {
      startingOption = FORM_OPTIONS.MARK_AS_REVIEWED;
    }
    if (fixed) {
      startingOption = FORM_OPTIONS.REMOVE_HIDDEN;
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

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      Html.addClass(element, "udoit-ignore-aria-hidden-nontabbable");
      issue.newHtml = Html.toString(element);
      handleActiveIssue(issue);
      return
    }

    if (activeOption === FORM_OPTIONS.REMOVE_HIDDEN) {
      let tempActiveContentItem = JSON.parse(JSON.stringify(activeContentItem));
      let fullPageHtml = tempActiveContentItem?.body;

      const parser = new DOMParser();
      const doc = parser.parseFromString(fullPageHtml, 'text/html');
      let errorElement = Html.findElementWithXpath(doc, activeIssue.xpath);

      let hidingElement = errorElement?.closest('[aria-hidden="true"]');
      if (hidingElement) {
        Html.removeAttribute(hidingElement, 'aria-hidden');
        Html.addClass(errorElement, "udoit-ignore-aria-hidden-nontabbable");
        tempActiveContentItem.body = Html.toString(doc.body);
        issue.newHtml = Html.toString(errorElement);
        handleActiveIssue(issue, activeOption, tempActiveContentItem);
        return;
      }
    }

    issue.newHtml = Html.toString(element);
    handleActiveIssue(issue);
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.REMOVE_HIDDEN]: [],
    }
    setFormErrors(tempErrors)
  }

  return (
    <>
      {/* OPTION 1: Remove "aria-hidden" from parent element. ID: "REMOVE_HIDDEN" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.REMOVE_HIDDEN ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.REMOVE_HIDDEN}
          labelText = {t('form.aria_hidden.decision.always_visible')}
        />
      </div>

      {/* OPTION 2: Ignore functional accordions. ID: "MARK_AS_REVIEWED" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_AS_REVIEWED}
          labelText = {t('form.aria_hidden.decicion.toggle')}
        />
      </div>
    </>
  )
}