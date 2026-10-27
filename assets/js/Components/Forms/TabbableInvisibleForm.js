import React, {useState, useEffect} from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import ToggleSwitch from '../Widgets/ToggleSwitch'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'
import { VALID_IMAGE_TAGS, UFIXIT_OPTIONS } from '../../Services/Constants'

export default function TabbableInvisibleForm({
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
    DELETE_ELEMENT: UFIXIT_OPTIONS.DELETE_ELEMENT,
    ADD_TEXT: UFIXIT_OPTIONS.ADD_TEXT
  }

  const CAN_CONTAIN_HREF = [
    'a',
    'area',
    'base',
    'link'
  ]

  const [textInputValue, setTextInputValue] = useState('');
  const [hasNonTextChildren, setHasNonTextChildren] = useState(false);
  const [hasNestedImage, setHasNestedImage] = useState(false);
  const [insertBefore, setInsertBefore] = useState(false);
  const [hideText, setHideText] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    if (activeIssue) {
      const html = Html.getIssueHtml(activeIssue);
      const element = Html.toElement(html);

      const tagName = Html.getTagName(element)?.toLowerCase();

      let tempHasNonTextChildren = false;
      let tempHasNestedImage = false;
      let tempTextInputValue = "";
      let tempImgAltValue = "";
      let tempInsertBefore = false;
      let tempHideText = false;
      let tempLinkUrl = "";

      if (element.children.length > 0) {
        tempHasNonTextChildren = true;
        if (element.childNodes[0].nodeType === 3) {
          tempInsertBefore = true;
        }

        // Does the element contain a nested image inside? If so, we can allow alt text instead of on-screen text.
        for (const child of element?.children) {
          let childTag = Html.getTagName(child)?.toLowerCase();
          if (VALID_IMAGE_TAGS.includes(childTag)) {
            tempHasNestedImage = true;
            if (tempImgAltValue === "") {
              tempImgAltValue = Html.getAccessibleName(child);
            }
          }
        }
      }

      // Does the element contain text?
      const initialText = Html.getInnerText(element);
      if (initialText) {
        tempTextInputValue = initialText;
      }
      // Does the element have alt text (or aria-label, etc)?
      else {
        const accessibleName = Html.getAccessibleName(element);
        if (accessibleName) {
          tempTextInputValue = accessibleName;
          if (tempHasNestedImage) {
            tempHideText = true;
          }
        }
        // If not, does it have a nested image with alt text?
        else if (tempImgAltValue !== '') {
          tempTextInputValue = tempImgAltValue;
          tempHideText = true;
        }
      }

      // Does the element contain a link?
      if (CAN_CONTAIN_HREF.includes(tagName)) {
        const href = Html.getAttribute(element, "href");
        tempLinkUrl = href || "";
      }

      setHasNonTextChildren(tempHasNonTextChildren);
      setTextInputValue(tempTextInputValue);
      setHasNestedImage(tempHasNestedImage);
      setInsertBefore(tempInsertBefore);
      setHideText(tempHideText);
      setLinkUrl(tempLinkUrl);

      const fixed = activeIssue.status > 0;
      const deleted = !activeIssue.newHtml;
      let startingOption = '';

      if (fixed) {
        if (deleted) {
          startingOption = FORM_OPTIONS.DELETE_ELEMENT;
        }
        else if (tempTextInputValue !== '') {
          startingOption = FORM_OPTIONS.ADD_TEXT;
        }
      }

      setActiveOption(startingOption);
      
    }
    setFormErrors([]);
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, textInputValue, hideText, insertBefore])

  const updateHtmlContent = () => {
    let issue = activeIssue

    if (activeOption === FORM_OPTIONS.DELETE_ELEMENT) {
      issue.newHtml = '';
      handleActiveIssue(issue);
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    let elementTag = Html.getTagName(element)?.toLowerCase() || ''

    if (activeOption === FORM_OPTIONS.ADD_TEXT) {
      
      // Links should be treated differently if they have an image inside, since alt text IS allowed.
      // https://www.w3.org/WAI/tutorials/images/functional/

      Html.removeAttribute(element, "aria-labelledby");
      Html.removeAttribute(element, "aria-label");
      Html.removeAttribute(element, "aria-hidden");
      Html.removeAttribute(element, "title");
      Html.removeAttribute(element, "alt");

      if ( CAN_CONTAIN_HREF.includes(elementTag) ) {

        if (element.children.length === 0) {
          element.innerText = textInputValue;
        }
        else {
          // Step 1: Remove all existing text nodes from the Element. Then we can put the new one in the right place.
          for (const child of element?.childNodes) {
            if (child.nodeType === 3) {   // Text Node
              child.remove();
            }
          }
          
          if (hasNestedImage) {
            for(const child of element?.children) {
              let childTag = Html.getTagName(child)?.toLowerCase();
              if (VALID_IMAGE_TAGS.includes(childTag)) {
                // If we're hiding the text, then the nested image requires alt text.
                if (hideText) {
                  Html.setAttribute(child, "alt", textInputValue);
                  Html.removeAttribute(child, "aria-hidden");
                  Html.removeAttribute(child, "role", "presentation");
                  Html.removeAttribute(child, "role", "none");
                  Html.addClass(element, issue.ignoreClass);
                }
                // If we're not hiding the text, the image should be marked as decorative (alt="").
                else {
                  Html.setAttribute(child, "alt", "");
                  Html.setAttribute(child, "role", "presentation");
                }
              }
            }
          }

          // If there are any children, we want to insert the new text node at the beginning or end.
          if (!hideText) {
            if (insertBefore) {
              element.children[0].insertAdjacentText("beforebegin", textInputValue);
            }
            else {
              element.children[element.children.length - 1].insertAdjacentText("afterend", textInputValue);
            }
          }
        }
      }
      else {
        element.innerText = textInputValue;
      }

    }

    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.DELETE_ELEMENT]: [],
      [FORM_OPTIONS.ADD_TEXT]: [],
    }
    
    if (activeOption === FORM_OPTIONS.ADD_TEXT) {
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.tabbable_invisible.msg.text_empty'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  return (
    <>
      {/* OPTION 1: Delete Element. ID: "DELETE_ELEMENT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_ELEMENT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.DELETE_ELEMENT}
          labelText = {t('form.tabbable_invisible.decision.delete')}
        />
        {activeOption === FORM_OPTIONS.DELETE_ELEMENT && (
          <OptionFeedback
            t={t}
            feedbackArray={formErrors[FORM_OPTIONS.DELETE_ELEMENT]}
          />
        )}
      </div>

      {/* OPTION 2: Add text. ID: "ADD_TEXT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_TEXT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_TEXT}
          labelId = 'add-text-label'
          labelText = {t('form.tabbable_invisible.decision.add_text')}
        />
        {activeOption === FORM_OPTIONS.ADD_TEXT && (
          <>
            <label>
              <div>{t('form.tabbable_invisible.label.text')}</div>
              <input
                className="w-100"
                type="text"
                value={textInputValue}
                onChange={handleInput}
                tabIndex="0"
                disabled={isDisabled}
              />
            </label>
            { hasNestedImage && (
              <>
                <label>
                  <ToggleSwitch
                    initialValue={hideText}
                    updateToggle={setHideText}
                    disabled={isDisabled}
                  />
                  <div>{t('form.tabbable_invisible.label.hide_text')}</div>
                </label>
                <div className="subtext">{t('form.tabbable_invisible.label.hide_text_desc')}</div>
              </>
            )}
            { hasNonTextChildren && (
              <>
                <label>
                  <ToggleSwitch
                    initialValue={insertBefore}
                    updateToggle={setInsertBefore}
                    disabled={isDisabled || hideText}
                  />
                  <div>{t('form.tabbable_invisible.label.insert_before')}</div>
                </label>
              </>
            )}
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]}
            />
          </>
        )}
      </div>
      
      {linkUrl !== '' && (
        <div className="url-container flex-row justify-content-between gap-2">
          <div className="subtext flex-shrink-0 align-self-center">{t('form.anchor.label.link_target')}</div>
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" tabIndex="0" className="link-small">
            {linkUrl}
          </a>
        </div>
      )}

    </>
  )
}