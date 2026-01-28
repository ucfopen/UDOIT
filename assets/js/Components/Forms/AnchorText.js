import React, {useState, useEffect} from 'react'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Text from '../../Services/Text'
import * as Html from '../../Services/Html'

export default function AnchorText({
  t,

  activeIssue,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed,
  setFormInvalid
}) {

  const FORM_OPTIONS = {
    ADD_TEXT: 'add-text',
    DELETE_LINK: 'delete-link',
    MARK_AS_REVIEWED: 'mark-as-reviewed'
  }

  const [activeOption, setActiveOption] = useState('')
  const [textInputValue, setTextInputValue] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [formErrors, setFormErrors] = useState([])
  const [deleteLink, setDeleteLink] = useState(false)

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

    let deleted = (!activeIssue.newHtml && (activeIssue.status === 1))

    if (deleted) {
      setActiveOption(FORM_OPTIONS.DELETE_LINK)
    }
    else if (initialText !== '') {
      setActiveOption(FORM_OPTIONS.ADD_TEXT)
    }
    else if (markAsReviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    } else {
      setActiveOption('')
    }
    
    setLinkUrl(Html.getAttribute(html, 'href') || '')
    setTextInputValue(initialText)
    setDeleteLink(deleted)
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, deleteLink, markAsReviewed])

  useEffect(() => {
    let invalid = false
    if(!markAsReviewed) {
      Object.keys(formErrors).forEach(optionKey => {
        if(formErrors[optionKey].length > 0) {
          invalid = true
        }
      })
    }
    setFormInvalid(invalid)
  }, [formErrors, markAsReviewed])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true
    
    if (markAsReviewed) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    const html = Html.getIssueHtml(activeIssue)
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
      [FORM_OPTIONS.DELETE_LINK]: [],
    }
    
    // If the "Delete Link" checkbox is checked, we don't need to check for input errors
    if(!deleteLink && !markAsReviewed) {
      if(!Text.isTextDescriptive(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.anchor.msg.text_descriptive'), type: 'error' })
      }
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({text: t('form.anchor.msg.text_empty'), type: 'error'})
      }
    }

    setFormErrors(tempErrors)
  }

  const handleOptionChange = (option) => {
    setActiveOption(option)

    if (option === FORM_OPTIONS.ADD_TEXT) {
      setDeleteLink(false)
      setMarkAsReviewed(false)
    } else if (option === FORM_OPTIONS.DELETE_LINK) {
      setDeleteLink(true)
      setMarkAsReviewed(false)
    } else if (option === FORM_OPTIONS.MARK_AS_REVIEWED) {
      setDeleteLink(false)
      setMarkAsReviewed(true)
    }
  }

  const handleInput = (event) => {
    const value = event.target.value
    setTextInputValue(value)
  }
  
  return (
    <div className="flex-column flex-grow-1 justify-content-between gap-2">

      <div className="flex-column gap-1">
        {/* OPTION 1: Add text. ID: "add-text" */}
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_TEXT ? 'selected' : ''}`}>
          <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
            <input
              type="radio"
              id={FORM_OPTIONS.ADD_TEXT}
              name="ufixitRadioOption"
              tabIndex="0"
              checked={activeOption === FORM_OPTIONS.ADD_TEXT}
              disabled={isDisabled}
              onChange={() => {
                handleOptionChange(FORM_OPTIONS.ADD_TEXT)
              }} />
            {t('form.anchor.link_text')}
          </label>
          {activeOption === FORM_OPTIONS.ADD_TEXT && (
            <>
              <input
                name="linkTextInput"
                id="linkTextInput"
                className="w-100"
                type="text"
                value={textInputValue}
                onChange={handleInput}
                tabIndex="0"
                disabled={isDisabled || deleteLink} />
              <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]} />
            </>
          )}
        </div>
        
        {/* OPTION 2: Delete Link. ID: "delete-link" */}
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_LINK ? 'selected' : ''}`}>
          <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
            <input
              type="radio"
              id={FORM_OPTIONS.DELETE_LINK}
              name="ufixitRadioOption"
              tabIndex="0"
              checked={activeOption === FORM_OPTIONS.DELETE_LINK}
              disabled={isDisabled}
              onChange={() => {
                handleOptionChange(FORM_OPTIONS.DELETE_LINK)
              }} />
            {t('form.anchor.delete_link')}
          </label>
          {activeOption === FORM_OPTIONS.DELETE_LINK && (
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.DELETE_LINK]} />
          )}
        </div>
        
        {/* OPTION 3: Mark as Reviewed. ID: "mark-as-reviewed" */}
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
          <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
            <input
              type="radio"
              id={FORM_OPTIONS.MARK_AS_REVIEWED}
              name="ufixitRadioOption"
              tabIndex="0"
              checked={activeOption === FORM_OPTIONS.MARK_AS_REVIEWED}
              disabled={isDisabled}
              onChange={() => {
                handleOptionChange(FORM_OPTIONS.MARK_AS_REVIEWED)
              }} />
            {t('fix.label.no_changes')}
          </label>
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