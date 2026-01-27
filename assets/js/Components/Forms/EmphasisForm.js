import React, { useState, useEffect } from 'react'
import OptionFeedback from '../Widgets/OptionFeedback'
import ToggleSwitch from '../Widgets/ToggleSwitch'
import * as Html from '../../Services/Html'
import * as Contrast from '../../Services/Contrast'

export default function EmphasisForm({
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
    ADD_EMPHASIS: 'add-emphasis',
    MARK_AS_REVIEWED: 'mark-as-reviewed'
  }
  const colorCssTriggers = ['color:', 'background']

  const [activeOption, setActiveOption] = useState('')
  const [useBold, setUseBold] = useState(false)
  const [useItalics, setUseItalics] = useState(false)
  const [removeColor, setRemoveColor] = useState(false)
  const [formErrors, setFormErrors] = useState([])

  const isBold = () => {
    const metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    return Html.getChild(element, 'strong') || Html.getChild(element, 'b') || metadata.fontWeight === 'bold'
  }

  const isItalicized = () => {
    const metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    return Html.getChild(element, 'em') || Html.getChild(element, 'i') || metadata.fontStyle === 'italic'
  }

  const hasStyleColor = () => {
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    const style = Html.getAttribute(element, 'style')?.toLowerCase() || ''
    const styleArray = style.split(';')
    for (let i = 0; i < styleArray.length; i++) {
      if(colorCssTriggers.some(trigger => styleArray[i].trim().startsWith(trigger))) {
        return true
      }
    }
    return false
  }

  useEffect(() => {
    if(!activeIssue) {
      return
    }

    const bold = isBold()
    const italicized = isItalicized()
    const styleColor = hasStyleColor()

    if(bold || italicized || !styleColor) {
      setActiveOption(FORM_OPTIONS.ADD_TEXT)
    }
    else if(markAsReviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else {
      setActiveOption('')
    }
    
    setUseBold(bold)
    setUseItalics(italicized)
    setRemoveColor(!styleColor)
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [useBold, useItalics, removeColor, markAsReviewed])

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

    if (option === FORM_OPTIONS.ADD_EMPHASIS) {
      setMarkAsReviewed(false)
    } else if (option === FORM_OPTIONS.MARK_AS_REVIEWED) {
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

    issue.newHtml = processHtml(issue.initialHtml)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_EMPHASIS]: [],
    }

    if(!markAsReviewed) {
      if(!isBold() && !isItalicized() && hasStyleColor()) {
        tempErrors[FORM_OPTIONS.ADD_EMPHASIS].push({ text: t('form.emphasis.msg.required'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const processHtml = (html) => {
    let element = Html.toElement(html)

    // Clean up tags
    Html.removeTag(element, 'strong')
    Html.removeTag(element, 'em')

    if (removeColor) {
      let style = Html.getAttribute(element, 'style') || ''
      let styleArray = style.split(';')
      styleArray = styleArray.filter(s => !(colorCssTriggers.some(trigger => s.trim().startsWith(trigger))))
      style = styleArray.join(';')
      element = Html.setAttribute(element, 'style', style)
    }
    if(useItalics) {
      element.innerHTML = `<em>${element.innerHTML}</em>`
    }
    if(useBold) {
      element.innerHTML = `<strong>${element.innerHTML}</strong>`  
    }
    
    return Html.toString(element)
  }

  const handleBoldToggle = (value) => {
    setUseBold(value)
  }

  const handleItalicsToggle = (value) => {
    setUseItalics(value)
  }

  const handleRemoveColorToggle = (value) => {
    setRemoveColor(value)
  }

  return (
    <>
      {/* OPTION 1: Add label. ID: "add-emphasis" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_EMPHASIS ? 'selected' : ''}`}>
        <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
          <input
            type="radio"
            id={FORM_OPTIONS.ADD_EMPHASIS}
            name="ufixitRadioOption"
            tabIndex="0"
            checked={activeOption === FORM_OPTIONS.ADD_EMPHASIS}
            disabled={isDisabled}
            onChange={() => {
              handleOptionChange(FORM_OPTIONS.ADD_EMPHASIS)
            }} />
          {t('form.emphasis.label.select_emphasis')}
        </label>
        {activeOption === FORM_OPTIONS.ADD_EMPHASIS && (
          <>
            <div className="flex-row justify-content-start gap-1">
              <ToggleSwitch
                labelId="boldCheckbox"
                initialValue={useBold}
                updateToggle={handleBoldToggle}
                disabled={isDisabled}
                small={true} />
              <label htmlFor="boldCheckbox" className="ufixit-instructions">{t('form.emphasis.label.bold')}</label>
            </div>
            <div className="flex-row justify-content-start gap-1 mt-2">
              <ToggleSwitch
                labelId="italicCheckbox"
                initialValue={useItalics}
                updateToggle={handleItalicsToggle}
                disabled={isDisabled}
                small={true} />
              <label htmlFor="italicCheckbox" className="ufixit-instructions">{t('form.emphasis.label.italic')}</label>
            </div>
            <div className="flex-row justify-content-start gap-1 mt-2">
              <ToggleSwitch
                labelId="removeColorCheckbox"
                initialValue={removeColor}
                updateToggle={handleRemoveColorToggle}
                disabled={isDisabled}
                small={true} />
              <label htmlFor="removeColorCheckbox" className="ufixit-instructions">{t('form.emphasis.label.remove_color')}</label>
            </div>
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.ADD_EMPHASIS]} />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Reviewed. ID: "mark-as-reviewed" */}
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