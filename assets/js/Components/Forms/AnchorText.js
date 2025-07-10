import React, {useState, useEffect} from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html'

export default function AnchorText({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
}) {

  const [textInputValue, setTextInputValue] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [textInputErrors, setTextInputErrors] = useState([])
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
    
    setLinkUrl(Html.getAttribute(html, 'href') || '')
    setTextInputValue(initialText)
    setDeleteLink(!activeIssue.newHtml && (activeIssue.status === 1))
  }, [activeIssue])

  useEffect(() => {
    updateActiveIssueHtml()
    checkFormErrors()
  }, [textInputValue, deleteLink])

  const updateActiveIssueHtml = () => {
    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    let elementTag = Html.getTagName(element)?.toLowerCase() || ''
    
    if(elementTag === 'a') {
      if(deleteLink) {
        element = Html.setInnerText(element, '')
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
    
    let issue = activeIssue
    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
  }

  const handleSubmit = () => {
    if(!deleteLink && textInputErrors.length > 0) {
      return
    }
    handleIssueSave(activeIssue)
  }

  const checkFormErrors = () => {
    let tempErrors = []
    
    // If the "Delete Link" checkbox is checked, we don't need to check for input errors
    if(!deleteLink) {
      if(!isTextDescriptive()) {
        tempErrors.push({ text: t('form.anchor.msg.text_descriptive'), type: 'error' })
      }
      if(!isTextNotEmpty()) {
        tempErrors.push({text: t('form.anchor.msg.text_empty'), type: 'error'})
      }
    }

    setTextInputErrors(tempErrors)
  }

  const isTextDescriptive = () => {
    const text = textInputValue.trim().toLowerCase()
    const badOptions = [
      'click',
      'click here',
      'details',
      'here',
      'learn',
      'learn more',
      'more',
      'more info',
      'more information',
      'read',
      'read more',
      'visit',
      'visit here',
    ]
    if (badOptions.includes(text)) {
      return false
    }
    return true
  }

  const isTextNotEmpty = () => {
    const text = textInputValue.trim().toLowerCase()
    if (text === '') {
      return false
    }
    return true
  }

  const handleInput = (event) => {
    const value = event.target.value
    setTextInputValue(value)
  }

  const handleDeleteCheckbox = (event) => {
    const checked = event.target.checked
    setDeleteLink(checked)
  }
  
  return (
    <>
      {linkUrl !== '' && (
        <div className="clarification-container flex-row gap-1 mb-3">
          <div className="instructions">Link:</div>
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" tabindex="0" style={{wordBreak: 'break-all'}}>
            {linkUrl}
          </a>
        </div>
      )}
      <label for="linkTextInput" className="instructions">{t('form.anchor.link_text')}</label>
      <input
        name="linkTextInput"
        id="linkTextInput"
        className="w-100 mt-2 mb-2"
        type="text"
        value={textInputValue}
        onChange={handleInput}
        tabindex="0"
        disabled={isDisabled || deleteLink} />
      <div className="separator mt-2">{t('fix.label.or')}</div>
      <div className="flex-row gap-1 mt-2">
        <input
          type="checkbox"
          name="deleteLinkCheckbox"
          id="deleteLinkCheckbox"
          checked={deleteLink}
          tabindex="0"
          disabled={isDisabled}
          onChange={handleDeleteCheckbox} />
        <label for="deleteLinkCheckbox" className="instructions">{t('form.anchor.delete_link')}</label>
      </div>
      <FormFeedback
        t={t}
        settings={settings}
        activeIssue={activeIssue}
        isDisabled={isDisabled}
        handleSubmit={handleSubmit}
        formErrors={textInputErrors} />
    </>
  )
}