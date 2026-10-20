import React, {useState, useEffect} from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import ToggleSwitch from '../Widgets/ToggleSwitch'
import { formNames } from '../../Services/Ufixit'
import * as Text from '../../Services/Text'
import * as Html from '../../Services/Html'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function AnchorTextForm ({
  t,
  activeIssue,
  isDisabled,
  doesIssueBelongToForm,
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
  const [linkUrl, setLinkUrl] = useState("")
  const [hideText, setHideText] = useState(false) 

  const html = Html.getIssueHtml(activeIssue)
  const element = Html.toElement(html)
  const elementTag = Html.getTagName(element)?.toLowerCase() || ''
  const hasImage = elementTag === 'a' && !!element.querySelector('img')

  useEffect(() => {
    if(!activeIssue) {
      return
    }
    const html = Html.getIssueHtml(activeIssue)
    let initialText = ''
    if(Html.getTagName(html)?.toLowerCase() === 'a') {
      initialText = Html.getInnerText(html)
    } else if(Html.getTagName(html)?.toLowerCase() === 'area') {
      initialText = Html.getAttribute(html, 'alt') || ''
    }
    setLinkUrl(Html.getAttribute(html, 'href') || '')
    setTextInputValue(initialText)

    const fixed = activeIssue.status > 0
    const deleted = !activeIssue.newHtml
    let startingOption = ''

    if (fixed) {
      if (deleted) {
        startingOption = FORM_OPTIONS.DELETE_ELEMENT
      }
      else if (initialText !== '') {
        startingOption = FORM_OPTIONS.ADD_TEXT
      }
    }
    handleOptionChange(startingOption)

  }, [activeIssue])

  useEffect(() => {
    if(!doesIssueBelongToForm(formNames.ANCHOR_TEXT, activeIssue?.issueData)) {
      return
    }
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, hideText])

  const handleOptionChange = (option) => {
    if(!doesIssueBelongToForm(formNames.ANCHOR_TEXT, activeIssue?.issueData)) {
      return
    }
    updateHtmlContent(option)
    checkFormErrors(option)
    setActiveOption(option)
  }

  const updateHtmlContent = (optionOverride = activeOption) => {
    let issue = activeIssue

    const html = Html.getIssueHtml(activeIssue)
    const deleteLink = (optionOverride === FORM_OPTIONS.DELETE_ELEMENT)
    let element = Html.toElement(html)
    let elementTag = Html.getTagName(element)?.toLowerCase() || ''
    
    if(elementTag === 'a') {
      if(deleteLink) {
        element = null
      } else if (hasImage && hideText) {
        element = Html.setInnerText(element, '')
        element = Html.setAttribute(element, 'aria-label', textInputValue);
        element.querySelector('img').setAttribute('aria-hidden', 'true');
      } else {
        element = Html.removeAttribute(element, 'aria-label')
        element = Html.setInnerText(element, textInputValue)
        element.querySelector('img')?.removeAttribute('aria-hidden');
      }
    }
    if(elementTag === 'area') {
      if(deleteLink) {
        element = Html.setAttribute(element, 'href', '')
        element = Html.setAttribute(element, 'alt', '')
        element = Html.setAttribute(element, 'title', '')
      } else {
        element = Html.setAttribute(element, 'href', linkUrl)
        element = Html.setAttribute(element, 'alt', textInputValue)
        element = Html.setAttribute(element, 'title', textInputValue)
      }
    }
    
    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue, optionOverride)
  }

  const checkFormErrors = (optionOverride = activeOption) => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_TEXT]: [],
      [FORM_OPTIONS.DELETE_ELEMENT]: [],
    }
    
    if(optionOverride === FORM_OPTIONS.ADD_TEXT) {
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
            setActiveOption={handleOptionChange}
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
            setActiveOption={handleOptionChange}
            option={FORM_OPTIONS.ADD_TEXT}
            labelId = 'add-text-label'
            labelText = {t('form.anchor_text.decision.add_context')}
          />

          {activeOption === FORM_OPTIONS.ADD_TEXT && (
            <>
              <div className="instructions mb-2">{t('form.anchor.link_text')}</div>
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
              {hasImage && (
                <label>
                  <ToggleSwitch
                    initialValue={hideText}
                    updateToggle={setHideText}
                    disabled={isDisabled}
                    small={false}
                  />
                  <div>{t('form.anchor.label.hide_text')}</div>
                  </label>
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