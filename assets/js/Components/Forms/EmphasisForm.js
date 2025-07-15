import React, { useState, useEffect } from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html'
import * as Contrast from '../../Services/Contrast'

export default function EmphasisForm({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleIssueSave,
  handleActiveIssue,
}) {
  const [useBold, setUseBold] = useState(false)
  const [useItalics, setUseItalics] = useState(false)
  const [removeColor, setRemoveColor] = useState(false)
  const [formErrors, setFormErrors] = useState([])

  useEffect(() => {
    if(!activeIssue) {
      return
    }
    setUseBold(isBold())
    setUseItalics(isItalicized())
    setRemoveColor(false)
  }, [activeIssue])

  useEffect(() => {
    updatePreview()
    checkFormErrors()
  }, [useBold, useItalics, removeColor])

  const updatePreview = () => {
    let issue = activeIssue
    const html = Html.getIssueHtml(activeIssue)

    issue.newHtml = processHtml(html)
    handleActiveIssue(issue)
  }

  const processHtml = (html) => {
    let element = Html.toElement(html)

    // Clean up tags
    Html.removeTag(element, 'strong')
    Html.removeTag(element, 'em')

    if (removeColor) {
      element = Html.removeAttribute(element, 'style')
    }
    if(useItalics) {
      element.innerHTML = `<em>${element.innerHTML}</em>`
    }
    if(useBold) {
      element.innerHTML = `<strong>${element.innerHTML}</strong>`  
    }
    
    return Html.toString(element)
  }

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

  const handleBoldToggle = () => {
    setUseBold(!useBold)
  }

  const handleItalicsToggle = () => {
    setUseItalics(!useItalics)
  }

  const handleRemoveColorToggle = () => {
    setRemoveColor(!removeColor)
  }

  const handleSubmit = () => {
    if (formErrors.length > 0) {
      return
    }
    let issue = activeIssue
    issue.newHtml = Contrast.convertHtmlRgb2Hex(issue.newHtml)
    handleIssueSave(issue)
  }

  const cssEmphasisIsValid = () => {
    if(!removeColor && !useBold && !useItalics) {
      return false
    }
    return true
  }

  const checkFormErrors = () => {
    let tempErrors = []
    if(!cssEmphasisIsValid(activeIssue)) {
      tempErrors.push({ text: t('form.emphasis.msg.required'), type: 'error' })
    }
    setFormErrors(tempErrors)
  }

  return (
    <>
      <div className="instructions">{t('form.emphasis.label.select_emphasis')}</div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="boldCheckbox"
          name="boldCheckbox"
          checked={useBold}
          tabIndex="0"
          disabled={isDisabled}
          onChange={handleBoldToggle} />
        <label htmlFor="boldCheckbox">{t('form.emphasis.label.bold')}</label>
      </div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="italicCheckbox"
          name="italicCheckbox"
          checked={useItalics}
          tabIndex="0"
          disabled={isDisabled}
          onChange={handleItalicsToggle} />
        <label htmlFor="italicCheckbox">{t('form.emphasis.label.italic')}</label>
      </div>
      <div className="separator mt-2">{t('fix.label.and_or')}</div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="removeColorCheckbox"
          name="removeColorCheckbox"
          checked={removeColor}
          tabIndex="0"
          disabled={isDisabled}
          onChange={handleRemoveColorToggle} />
        <label className="instructions" htmlFor="removeColorCheckbox">{t('form.emphasis.label.remove_color')}</label>
      </div>
      <FormFeedback
        t={t}
        settings={settings}
        activeIssue={activeIssue}
        isDisabled={isDisabled}
        handleSubmit={handleSubmit}
        formErrors={formErrors} />
    </>
  )
}