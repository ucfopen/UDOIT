import React, {useState, useEffect, act} from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Text from '../../Services/Text'
import * as Html from '../../Services/Html'

export default function AnchorText({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
}) {

  const FORM_OPTIONS = {
    ADD_TEXT: settings.UFIXIT_OPTIONS.ADD_TEXT,
    DELETE_ELEMENT: settings.UFIXIT_OPTIONS.DELETE_ELEMENT,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  const [textInputValue, setTextInputValue] = useState("")
  const [linkUrl, setLinkUrl] = useState("")

  useEffect(() => {
    if(!activeIssue) {
      return
    }
    const html = Html.getIssueHtml(activeIssue)
    let initialText = ''
    if(Html.getTagName(html).toLowerCase() === 'a') {
      initialText = Html.getInnerText(html)
    } else if(Html.getTagName(html).toLowerCase() === 'area') {
      initialText = Html.getAttribute(html, 'alt') || ''
    }

    const deleted = (!activeIssue.newHtml && (activeIssue.status === 1))
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)

    if (deleted) {
      setActiveOption(FORM_OPTIONS.DELETE_ELEMENT)
    }
    else if (reviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else if (initialText !== '') {
      setActiveOption(FORM_OPTIONS.ADD_TEXT)
    }
    else {
      setActiveOption('')
    }
    
    setLinkUrl(Html.getAttribute(html, 'href') || '')
    setTextInputValue(initialText)
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, textInputValue])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true
    
    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    const deleteLink = (activeOption === FORM_OPTIONS.DELETE_ELEMENT)
    let element = Html.toElement(html)
    let elementTag = Html.getTagName(element)?.toLowerCase() || ''
    
    if(elementTag === 'a') {
      if(deleteLink) {
        element = null
      } else {
        element = Html.setInnerText(element, textInputValue)
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
        {/* OPTION 1: Add text. ID: "ADD_TEXT" */}
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_TEXT ? 'selected' : ''}`}>
          <RadioSelector
            activeOption={activeOption}
            isDisabled={isDisabled}
            setActiveOption={setActiveOption}
            option={FORM_OPTIONS.ADD_TEXT}
            labelId = 'add-text-label'
            labelText = {t('form.anchor.link_text')}
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
                disabled={isDisabled} />
              <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]} />
            </>
          )}
        </div>
        
        {/* OPTION 2: Delete Link. ID: "DELETE_ELEMENT" */}
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_ELEMENT ? 'selected' : ''}`}>
          <RadioSelector
            activeOption={activeOption}
            isDisabled={isDisabled}
            setActiveOption={setActiveOption}
            option={FORM_OPTIONS.DELETE_ELEMENT}
            labelText = {t('form.anchor.delete_link')}
            />
          {activeOption === FORM_OPTIONS.DELETE_ELEMENT && (
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.DELETE_ELEMENT]} />
          )}
        </div>
        
        {/* OPTION 3: Mark as Reviewed. ID: "MARK_AS_REVIEWED" */}
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
          <RadioSelector
            activeOption={activeOption}
            isDisabled={isDisabled}
            setActiveOption={setActiveOption}
            option={FORM_OPTIONS.MARK_AS_REVIEWED}
            labelText = {t('fix.label.no_changes')}
            />
        </div>
      </div>

      {linkUrl !== '' && (
        <div className="url-container flex-row justify-content-between gap-2">
          <div className="subtext">{t('form.anchor.label.link_target')}</div>
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" tabIndex="0" className="link-small">
            {linkUrl}
          </a>
        </div>
      )}
    </div>
  )
}