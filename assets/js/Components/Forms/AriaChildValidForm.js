import React, { useEffect, useRef, useState } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import CodeIcon from '../Icons/CodeIcon'
import MagicIcon from '../Icons/MagicIcon'
import UndoIcon from '../Icons/UndoIcon'
import { UFIXIT_OPTIONS } from '../../Services/Constants'
import * as Html from '../../Services/Html'
// The SensoryMisuseForm.css file is a copy of the tinyMCE oxide skin file, which does not consistently load at runtime, so we include it here
// Failure to do so often results in the TinyMCE editor not display, especially the first time the component is rendered.
import './SensoryMisuseForm.css'

export default function AriaChildValidForm({
  t, 
  activeIssue, 
  handleIssueSave, 
  addMessage,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors,
  setPreviewData
}) {

  const FORM_OPTIONS = {
    EDIT_TEXT: UFIXIT_OPTIONS.ADD_TEXT,
    DELETE_ELEMENT: UFIXIT_OPTIONS.DELETE_ELEMENT
  }

  /* Extrapolated from https://github.com/IBMa/equal-access/blob/1ea7a8a7d739bb0f57f1d025215c8a6adec0f258/accessibility-checker-engine/src/v2/aria/ARIADefinitions.ts#L264 */
  const REQUIRED_CHILDREN = {
    "feed": ["article"],
    "grid": ["row", "rowgroup"], // rowgroup is not required, but it is allowed
    "list": ["listitem"],
    "listbox": ["group", "option"], // group is not required, but it is allowed
    "menu": ["group", "menuitem", "menuitemcheckbox", "menuitemradio"], // group is not required, but it is allowed
    "menubar": ["group", "menuitem", "menuitemcheckbox", "menuitemradio"], // group is not required, but it is allowed
    "radiogroup": ["radio"],
    "row": ["cell", "columnheader", "gridcell", "rowheader"],
    "rowgroup": ["row"],
    "table": ["row", "rowgroup", "caption"], // rowgroup and caption are not required, but are allowed
    "tablist": ["tab"],
    "tree": ["group", "treeitem"], // group is not required, but it is allowed
    "treegrid": ["row", "rowgroup"] // rowgroup is not required, but it is allowed
  }

  const ROLE_TEXT_INSUFFICIENT = [
    "menu",
    "menubar",
    "radiogroup",
    "tablist",
  ]

  const [initialHtml, setInitialHtml] = useState('');
  const [localHtml, setLocalHtml] = useState(Html.getIssueHtml(activeIssue));
  const [showCode, setShowCode] = useState(false);
  const [invalidChildren, setInvalidChildren] = useState([]);

  useEffect(() => {
    // if the issue changes, pull new html and set tinymce's html
    if (!activeIssue) {
      return;
    }
    
    let html = Html.getIssueHtml(activeIssue);
    setInitialHtml(html);
    setLocalHtml(html);
    setFormErrors([]);

    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3);
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3);
    const deleted = !activeIssue.newHtml;
    
    let startingOption = '';

    if (reviewed){
      startingOption = FORM_OPTIONS.MARK_AS_REVIEWED;
    }
    if (fixed) {
      if (deleted) {
        startingOption = FORM_OPTIONS.DELETE_ELEMENT;
      }
      else {
        startingOption = FORM_OPTIONS.EDIT_TEXT;
      }
    }

    setActiveOption(startingOption);
  }, [activeIssue])

  useEffect(() => {
    checkFormErrors();
    updatePreview();
  }, [activeOption, localHtml])

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.EDIT_TEXT]: []
    };
    let tempPreviewData = [];
    let tempInvalidChildren = [];

    if(activeOption === FORM_OPTIONS.EDIT_TEXT) {

      const parentElement = Html.toElement(localHtml);
      const parentElementRole = Html.getRole(parentElement);
      const parentElementIssues = {
        "must_contain": [],
        "must_not_contain": []
      };

      // If the parent element requires specific children, make sure that all children match.
      if (REQUIRED_CHILDREN[parentElementRole]) {
        const childRequiredRoles = REQUIRED_CHILDREN[parentElementRole];
        let hasRequiredChild = false;
        let issueNumber = 1;
        const childElements = parentElement.children;
        for (let i = 0; i < childElements.length; i++) {
          let childElementRole = Html.getRole(childElements[i]);
          if (childRequiredRoles.includes(childElementRole)) {
            hasRequiredChild = true;
          }
          else {
            let childXpath = Html.findXpathFromElement(childElements[i]);
            tempErrors[FORM_OPTIONS.EDIT_TEXT].push({ text: t('form.aria_child_valid.must_not_contain', { parentRole: parentElementRole, childRole: childElementRole }), type: "error", number: issueNumber });
            tempPreviewData.push({xpath: childXpath, number: issueNumber });
            tempInvalidChildren.push({xpath: childXpath, parentRole: parentElementRole, childRole: childElementRole });
            issueNumber++;
          }
        }

        if (!hasRequiredChild) {
          parentElementIssues["must_contain"].push({parentRole: parentElementRole, childRole: childRequiredRoles.join(', ')});
        }
      }

      parentElementIssues["must_contain"].forEach(issue => {
        tempErrors[FORM_OPTIONS.EDIT_TEXT].push({ text: t('form.aria_child_valid.must_contain', { parentRole: issue.parentRole, childRole: issue.childRole }), type: "error" });  
      });

      parentElementIssues["must_not_contain"].forEach(issue => {
        tempErrors[FORM_OPTIONS.EDIT_TEXT].push({ text: t('form.aria_child_valid.must_not_contain', { parentRole: issue.parentRole, childRole: issue.childRole }), type: "error", number: issueNumber });
      });
    }

    // If there are not multiple errors, we don't need to number them.
    if (tempPreviewData.length < 2) {
      tempErrors[FORM_OPTIONS.EDIT_TEXT].forEach(tempError => {
        tempError.number = undefined;
      })
    }
    
    setPreviewData(tempPreviewData);
    setInvalidChildren(tempInvalidChildren);
    setFormErrors(tempErrors);
  }

  const handleAutoFix = () => {

    let issue = activeIssue;
    const html = Html.getIssueHtml(issue);
    let element = Html.toElement(html);

    // CASE 1: If the element is empty, just remove it. It's a leftover.
    if (element.innerHTML?.trim() === '') {
      setLocalHtml('');
      return;
    }

    // CASE 2: If there is only text, but no child element...
    if (element.children?.length === 0) {
      const textContent = element.textContent || '';
      const parentTagRole = Html.getRole(element);

      // CASE 2.A: Certain roles require additional attributes and/or scripted functionality to work.
      // Just adding a `menuitem` role, for instance, wouldn't make a working menu.

      if (ROLE_TEXT_INSUFFICIENT.includes(parentTagRole)) {
        let noRole = Html.renameElement(element, 'p');
        noRole = Html.removeAttribute(noRole, "role");
        const noRoleString = noRole.outerHTML;

        setLocalHtml(noRoleString);
        return;
      }
      
      // CASE 2.B: If text just needs to be contained in a proper child element, then we can do that.
      const roleToWrapper = {
        "feed": `<article>${textContent}</article>`,
        "grid": `<tr><td>${textContent}</td></tr>`,
        "list": `<li>${textContent}</li>`,
        "listbox": `<div role="option">${textContent}</div>`,
        "row": `<td>${textContent}</td>`,
        "rowgroup": `<tr><td>${textContent}</td></tr>`,
        "table": `<tr><td>${textContent}</td></tr>`,
        "tree": `<div role="treeitem">${textContent}</div>`,
        "treegrid": `<tr><td>${textContent}</td></tr>`,
      }

      if (roleToWrapper[parentTagRole]) {
        element.innerHTML = roleToWrapper[parentTagRole];
        const addedRoleString = element.outerHTML;
        setLocalHtml(addedRoleString);
        return;
      }
    }
    
    // CASE 3: If there ARE children, then some may be valid. Use the invalidChildren array to 
    // fix the ones that don't have the proper roles.
    
    // Start at the last child and work backward, otherwise element xpaths might become invalid.
    for(let i = invalidChildren.length - 1; i >= 0; i--) {

      const childElement = Html.findElementWithXpath(element, invalidChildren[i].xpath, true);
      if (!childElement) {
        continue;
      }

      const childClone = Html.toElement(Html.toString(childElement));

      const PARENT_CHILD_WRAPPER = {
        "feed": {childRole: "article", wrapper: "<article></article>"},
        "grid": {childRole: "", wrapper: "<tr><td></td></tr>"},
        "listbox": {childRole: "option", wrapper: "<div role='option'></div>"},
        "menu": {childRole: "menuitem", wrapper: "<div role='menuitem'></div>"},
        "menubar": {childRole: "menuitem", wrapper: "<div role='menuitem'></div>"},
        "radiogroup": {childRole: "radio", wrapper: "<div role='radio'></div>"},
        "row": {childRole: "cell", wrapper: "<td></td>"},
        "rowgroup": {childRole: "", wrapper: "<tr><td></td></tr>"},
        "table": {childRole: "", wrapper: "<tr><td></td></tr>"},
        "tablist": {childRole: "tab", wrapper: "<div role='tab'></div>"},
        "tree": {childRole: "menuitem", wrapper: "<div role='treeitem'></div>"},
        "treegrid": {childRole: "", wrapper: "<tr><td></td></tr>"},
      }

      // Case 3.A: A list contains something other than a list item (86% of test cases)
      // This case is handled separately because ideally, you don't just want to nest an inner list
      // inside another list item, since that can ruin an ordered list's ordering.
      if (invalidChildren[i].parentRole === 'list') {

        // If the invalid list is after another list item, insert it at the end of that list item.
        let previousSibling = childElement.previousElementSibling;
        if (previousSibling && Html.getRole(previousSibling) === 'listitem') {
          previousSibling.appendChild(childClone);
          childElement.remove();
        }
        else {
          const wrapperElement = Html.toElement("<li style='list-style-type: none;'></li>");
          wrapperElement.appendChild(childClone);
          childElement.before(wrapperElement);
          childElement.remove();
        }
      }

      // Case 3.B: If not a list, assign the child with the proper role if it doesn't already have one,
      // or nest it inside a child with the correct role if needed.
      else {
        const {childRole, wrapper} = PARENT_CHILD_WRAPPER[invalidChildren[i].parentRole];
        
        if (invalidChildren[i].childRole === 'generic' && childRole !== '') {
          Html.setAttribute(childElement, "role", childRole);
        }
        else {
          let wrapperElement = Html.toElement(wrapper);
          // Sometimes we wrap multiple layers, like a <td> inside a <tr>. If so, we want to insert
          // the original child code inside the <td>.
          if (wrapperElement.children?.length > 0) {
            wrapperElement.children[0].appendChild(childClone);
          }
          else {
            wrapperElement.appendChild(childClone);
          }
          childElement.before(wrapperElement);
          childElement.remove();
        }
      }
    }

    const updatedString = element.outerHTML;
    setLocalHtml(updatedString);
  }

  const handleUndo = () => {
    setLocalHtml(initialHtml);
  }

  const updatePreview = () => {
    let issue = activeIssue;

    if (activeOption === FORM_OPTIONS.EDIT_TEXT) {
      issue.newHtml = localHtml;
    }
    else if (activeOption === FORM_OPTIONS.DELETE_ELEMENT) {
      issue.newHtml = '';
    }

    handleActiveIssue(issue);
  }

  return (
    <>
      {/* OPTION 1: Edit text. ID: "EDIT_TEXT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.EDIT_TEXT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.EDIT_TEXT}
          labelId = 'edit-text-label'
          labelText = {t('form.aria_child_valid.label.update_pairing')}
        />

        { activeOption === FORM_OPTIONS.EDIT_TEXT && (
          <>
            <div className="flex-row justify-content-between gap-3">
              <div className="flex-row align-items-center gap-2">
                <button 
                  className="btn-small btn-icon-left btn-secondary"
                  onClick={handleAutoFix}
                  disabled={isDisabled || formErrors[FORM_OPTIONS.EDIT_TEXT]?.length === 0}
                >
                  <MagicIcon className="icon-md" alt="" aria-hidden="true"/>
                  {t('form.list.button.auto_fix')}
                </button>
                <button 
                  className="btn-small btn-icon-only btn-secondary"
                  onClick={handleUndo}
                  disabled={isDisabled || (initialHtml === localHtml)}
                  aria-label={t('fix.button.undo')}
                  title={t('fix.button.undo')}
                >
                  <UndoIcon className="icon-md" alt="" aria-hidden="true"/>
                </button>
              </div>
              <div className="flex-row align-items-center">
                <button 
                  className="btn-small btn-icon-only btn-secondary"
                  onClick={() => setShowCode(!showCode)}
                  aria-label={t('form.aria_child_valid.button.toggle_code')}
                  title={t('form.aria_child_valid.button.toggle_code')}
                >
                  <CodeIcon className="icon-md" alt="" aria-hidden="true"/>
                </button>
              </div>
            </div>
            { showCode && (
              <textarea
                className="mt-3"
                id="aria-child-valid-textarea" 
                readOnly
                rows="6"
                value={ (localHtml || '') }>
              </textarea>
            )}
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.EDIT_TEXT]}
            />
          </>
        )}
      </div>

      {/* OPTION 2: Delete element. ID: "DELETE_ELEMENT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_ELEMENT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.DELETE_ELEMENT}
          labelText = {t('form.aria_child_valid.label.remove_element')}
        />
      </div>
    </>
  )
}