import React, {useState, useEffect} from 'react'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function HeadingEmptyForm({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed,
  setFormInvalid
}) {

  const FORM_OPTIONS = {
    ADD_TEXT: 'add-text',
    DELETE_HEADING: 'delete-heading',
    MARK_AS_REVIEWED: 'mark-as-reviewed'
  }

  const [activeOption, setActiveOption] = useState('')
  const [textInputValue, setTextInputValue] = useState('')
  const [deleteHeading, setDeleteHeading] = useState(false)
  const [formErrors, setFormErrors] = useState([])

  useEffect(() => {
    if (activeIssue) {
      const html = Html.getIssueHtml(activeIssue)
      const element = Html.toElement(html)

      let initialText = (element ? element.innerText : '')
      let deleted = (!activeIssue.newHtml && (activeIssue.status === 1))

      if (deleted) {
        setActiveOption(FORM_OPTIONS.DELETE_HEADING)
      }
      else if (initialText !== '') {
        setActiveOption(FORM_OPTIONS.ADD_TEXT)
      }
      else if (markAsReviewed) {
        setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
      } else {
        setActiveOption('')
      }

      setTextInputValue(initialText)
      setDeleteHeading(deleted)
    }
    setFormErrors([])
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, deleteHeading, markAsReviewed])

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

  const handleOptionChange = (option) => {
    setActiveOption(option)

    if (option === FORM_OPTIONS.ADD_TEXT) {
      setDeleteHeading(false)
      setMarkAsReviewed(false)
    } else if (option === FORM_OPTIONS.DELETE_HEADING) {
      setDeleteHeading(true)
      setMarkAsReviewed(false)
    } else if (option === FORM_OPTIONS.MARK_AS_REVIEWED) {
      setDeleteHeading(false)
      setMarkAsReviewed(true)
    }
  }

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true 
    if (markAsReviewed) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    issue.newHtml = processHtml()
    handleActiveIssue(issue)
  }

  const processHtml = () => {
    if (deleteHeading) {
      return '';
    }

    const html = Html.getIssueHtml(activeIssue)
    return Html.toString(Html.setInnerText(html, textInputValue))
  }


  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_TEXT]: [],
      [FORM_OPTIONS.DELETE_HEADING]: [],
    }
    
    // If the "Delete Heading" checkbox is checked, we don't need to check for input errors
    if (!deleteHeading && !markAsReviewed) {
      if(Text.isTextEmpty(textInputValue)) {
        tempErrors[FORM_OPTIONS.ADD_TEXT].push({ text: t('form.heading_empty.msg.text_empty'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  return (
    <>
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
          {t('form.heading_empty.label.text')}
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
              disabled={isDisabled} />
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.ADD_TEXT]} />
          </>
        )}
      </div>
      
      {/* OPTION 2: Delete Heading. ID: "delete-heading" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_HEADING ? 'selected' : ''}`}>
        <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
          <input
            type="radio"
            id={FORM_OPTIONS.DELETE_HEADING}
            name="ufixitRadioOption"
            tabIndex="0"
            checked={activeOption === FORM_OPTIONS.DELETE_HEADING}
            disabled={isDisabled}
            onChange={() => {
              handleOptionChange(FORM_OPTIONS.DELETE_HEADING)
            }} />
          {t('form.heading_empty.label.remove_heading')}
        </label>
        {activeOption === FORM_OPTIONS.DELETE_HEADING && (
          <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.DELETE_HEADING]} />
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
    </>
  )
}