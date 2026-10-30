import React, {useState, useEffect} from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import ToggleSwitch from '../Widgets/ToggleSwitch'
import * as Text from '../../Services/Text'
import * as Html from '../../Services/Html'
import { VALID_IMAGE_TAGS, UFIXIT_OPTIONS } from '../../Services/Constants'

export default function AnchorTextForm ({
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
    DELETE_ELEMENT: UFIXIT_OPTIONS.DELETE_ELEMENT
  }

  const [textInputValue, setTextInputValue] = useState("")
  const [hasNestedImage, setHasNestedImage] = useState(false);
  const [hideText, setHideText] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  useEffect(() => {
    if(!activeIssue) {
      return
    }
    const html = Html.getIssueHtml(activeIssue);
    const element = Html.toElement(html);

    let tempHasNestedImage = false;
    let tempTextInputValue = "";
    let tempImgAltValue = "";
    let tempHideText = false;
    let tempLinkUrl = Html.getAttribute(element, "href") || '';

    if (element.children.length > 0) {

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

    setTextInputValue(tempTextInputValue);
    setHasNestedImage(tempHasNestedImage);
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

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, textInputValue, hideText])


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
    
    if(elementTag === 'a') {
      Html.removeAttribute(element, "aria-labelledby");
      Html.removeAttribute(element, "aria-label");
      Html.removeAttribute(element, "aria-hidden");
      Html.removeAttribute(element, "title");
      Html.removeAttribute(element, "alt");

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
                Html.setAttribute(child, "aria-hidden", true);
              }
            }
          }
        }
        
        if (!hideText) {
          element.children[element.children.length - 1].insertAdjacentText("afterend", textInputValue);
        }
      }
    }
    if(elementTag === 'area') {
      element = Html.setAttribute(element, 'href', linkUrl)
      element = Html.setAttribute(element, 'alt', textInputValue)
      element = Html.setAttribute(element, 'title', textInputValue)
    }
    
    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_TEXT]: [],
      [FORM_OPTIONS.DELETE_ELEMENT]: [],
    }
    
    if(activeOption === FORM_OPTIONS.ADD_TEXT) {
      if(!Text.isTextDescriptive(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.anchor.msg.text_descriptive'), type: 'error' })
      }
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({text: t('form.anchor.msg.text_empty'), type: 'error'})
      }
    }

    setFormErrors(tempErrors)
  }

  const handleInput = (event) => {
    const value = event.target.value
    setTextInputValue(value)
  }
  
  return (
    <div className="flex-column flex-grow-1 justify-content-between gap-2">

      <div className="flex-column gap-1">

        {/* OPTION 1: Delete Link. ID: "DELETE_ELEMENT" */}
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_ELEMENT ? 'selected' : ''}`}>
          <RadioSelector
            activeOption={activeOption}
            isDisabled={isDisabled}
            setActiveOption={setActiveOption}
            option={FORM_OPTIONS.DELETE_ELEMENT}
            labelText = {t('form.anchor_text.decision.delete')}
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
            labelText = {t('form.anchor_text.decision.add_context')}
          />

          {activeOption === FORM_OPTIONS.ADD_TEXT && (
            <>
              <label>
                <div>{t('form.anchor.label.link_text')}</div>
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
              {hasNestedImage && (
                <>
                  <label>
                    <ToggleSwitch
                      initialValue={hideText}
                      updateToggle={setHideText}
                      disabled={isDisabled}
                    />
                    <div>{t('form.anchor.label.hide_text')}</div>
                  </label>
                  <div className="subtext">{t('form.tabbable_invisible.label.hide_text_desc')}</div>
                </>
              )}
            </>    
          )}
        </div>   
      </div>

      {linkUrl !== '' && (
        <div className="url-container flex-row justify-content-between gap-2">
          <div className="subtext flex-shrink-0 align-self-center">{t('form.anchor.label.link_target')}</div>
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" tabIndex="0" className="link-small">
            {linkUrl}
          </a>
        </div>
      )}
    </div>
  )
}