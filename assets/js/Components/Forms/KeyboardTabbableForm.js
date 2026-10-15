import React, { useState, useEffect } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import ToggleSwitch from '../Widgets/ToggleSwitch'
import * as Html from '../../Services/Html'
import { TAG_IMPLICIT_ROLE, UFIXIT_OPTIONS, WIDGET_ROLES } from '../../Services/Constants'

export default function KeyboardTabbableForm({
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
    REMOVE_ROLE: UFIXIT_OPTIONS.DELETE_ATTRIBUTE,
    ENFORCE_TABINDEX: UFIXIT_OPTIONS.ADD_EMPHASIS
  };

  const BLOCKING_WIDGETS = [
    "grid",
    "menu",
    "menubar",
    "radiogroup",
    "slider",
    "tablist",
    "textbox",
    "tree",
    "treegrid",
  ]

  const [mergeText, setMergeText] = useState(false);
  const [surroundingText, setSurroundingText] = useState(false);
  const [cachedXpath, setCachedXpath] = useState('');

  const hasSurroundingText = () => {
    let tempActiveContentItem = JSON.parse(JSON.stringify(activeContentItem));
    let fullPageHtml = tempActiveContentItem?.body;

    const parser = new DOMParser();
    const doc = parser.parseFromString(fullPageHtml, 'text/html');
    const errorElement = Html.findElementWithXpath(doc, activeIssue.xpath);
    if (errorElement && errorElement.textContent !== '') {
      const previousSibling = errorElement.previousSibling;
      const nextSibling = errorElement.nextSibling;
      if (previousSibling?.nodeType === 3 || nextSibling?.nodeType === 3) {
        return true;
      }
    }
    return false;
  }

  useEffect(() => {
    if(!activeIssue) {
      return;
    }

    const html = Html.getIssueHtml(activeIssue);
    const element = Html.toElement(html);
    const tabIndex = Html.getAttribute(element, "tabindex");
    const ariaRole = Html.getRole(element);

    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3);
    let startingOption = '';

    if (fixed) {
      if (WIDGET_ROLES.includes(ariaRole) && tabIndex === "0") {
        startingOption = FORM_OPTIONS.ENFORCE_TABINDEX;
      }
      else if (!WIDGET_ROLES.includes(ariaRole) && (!tabIndex || tabIndex === "-1") ) {
        startingOption = FORM_OPTIONS.REMOVE_ROLE;
      }
    }
    setSurroundingText(hasSurroundingText());
    setActiveOption(startingOption);
    setCachedXpath(activeIssue.xpath);
    setMergeText(false);

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, mergeText])

  const updateHtmlContent = () => {

    let issue = activeIssue;
    let element = Html.toElement(issue.initialHtml);

    if (activeOption === FORM_OPTIONS.REMOVE_ROLE) {
      let tempActiveContentItem = JSON.parse(JSON.stringify(activeContentItem));
      let fullPageHtml = tempActiveContentItem?.body;

      const parser = new DOMParser();
      const doc = parser.parseFromString(fullPageHtml, 'text/html');
      let errorElement = Html.findElementWithXpath(doc, cachedXpath);
      if (!errorElement) {
        return;
      }

      // OPTION 1: Turn the widget into plain text, and merge it into other plain text, if there is
      // any before or after it.
      // Example: <parent>Normal sentence <span role="widget">active text</span> more text.</parent>
      //      ==> <parent>Normal sentence active text more text.</parent>
      if (mergeText) {
        let innerText = errorElement.innerText;
        const previousSibling = errorElement.previousSibling;
        if (previousSibling?.nodeType === 3) {
          innerText = previousSibling.textContent + innerText;
          previousSibling.remove();
        }
        const nextSibling = errorElement.nextSibling;
        if (nextSibling?.nodeType === 3) {
          innerText = innerText + nextSibling.textContent;
          nextSibling.remove();
        }

        const textNode = document.createTextNode(innerText);
        errorElement.replaceWith(textNode);
        const newElement = textNode.parentElement;
        if (!newElement) {
          issue.newHtml = '';
        }
        else {
          let newXpath = Html.findXpathFromElement(newElement);
          issue.xpath = newXpath || '';
          issue.newHtml = Html.toString(newElement);
        }
        tempActiveContentItem.body = Html.toString(doc.body);
        handleActiveIssue(issue, activeOption, tempActiveContentItem);
      }

      else {
        // Whether the "role" caused the issue or the tag, we'd remove the role either way.
        if (Html.hasAttribute(errorElement, "role")) {
          Html.removeAttribute(errorElement, "role");
        }

        // If the tag's implicit role is why this is flagged as a widget (like <button> = 'role="button"'),
        // then we swap that element for a duplicate <div> (for blocking elements) or <span>.
        const tagName = Html.getTagName(errorElement)?.toLowerCase();
        const tagRole = TAG_IMPLICIT_ROLE[tagName] || '';
        const parentElement = errorElement.parentElement;
        if (WIDGET_ROLES.includes(tagRole) && parentElement) {
          const newTagName = (BLOCKING_WIDGETS.includes(tagRole) ? "div" : "span")
          const newElement = Html.renameElement(errorElement, newTagName);
          parentElement.replaceChild(newElement, errorElement);
          let newXpath = Html.findXpathFromElement(newElement);
          issue.xpath = newXpath || '';
          issue.newHtml = Html.toString(newElement);
        }
        else {
          issue.xpath = cachedXpath;
          issue.newHtml = Html.toString(errorElement);
        }
        
        tempActiveContentItem.body = Html.toString(doc.body);
        handleActiveIssue(issue, activeOption, tempActiveContentItem);
      }
    }

    else if (activeOption === FORM_OPTIONS.ENFORCE_TABINDEX) {
      Html.setAttribute(element, "tabindex", "0");
      issue.xpath = cachedXpath;
      issue.newHtml = Html.toString(element);
      handleActiveIssue(issue);
    }
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.REMOVE_ROLE]: [],
      [FORM_OPTIONS.ENFORCE_TABINDEX]: [],
    }
    setFormErrors(tempErrors)
  }

  return (
    <>
      {/* OPTION 1: Make the element tabbable with tabIndex="0" ID: "ENFORCE_TABINDEX" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ENFORCE_TABINDEX ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ENFORCE_TABINDEX}
          labelText = {t('form.keyboard_tabbable.decision.add_tabindex')}
        />
      </div>

      {/* OPTION 2: Remove the widget role. ID: "REMOVE_ROLE" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.REMOVE_ROLE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.REMOVE_ROLE}
          labelText = {t('form.keyboard_tabbable.decision.remove_role')}
        />
        { activeOption === FORM_OPTIONS.REMOVE_ROLE && surroundingText && (
          <>
            <div className="flex-row justify-content-start gap-2">
              <ToggleSwitch
                labelId="textOnlyCheckbox"
                initialValue={mergeText}
                updateToggle={setMergeText}
                disabled={isDisabled}
                small={false}
              />
              <label id="textOnlyCheckbox" className="ufixit-instructions align-self-center">{t('form.keyboard_tabbable.label.merge_text')}</label>
            </div>
          </>
        )}
      </div>
    </>
  )
}