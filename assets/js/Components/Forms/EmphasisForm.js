import React, { useState, useEffect } from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html'
import * as Contrast from '../../Services/Contrast'

export default function EmphasisForm({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  addMessage,
  handleActiveIssue,
  handleManualScan
}) {
  const [useBold, setUseBold] = useState(false)
  const [useItalics, setUseItalics] = useState(false)
  const [checkboxErrors, setCheckboxErrors] = useState([])

  useEffect(() => {
    setUseBold(isBold())
    setUseItalics(isItalicized())
  }, [activeIssue])

  useEffect(() => {
    updatePreview()
    checkFormErrors()
  }, [useBold, useItalics])

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

    element.innerHTML = (useBold) ? `<strong>${element.innerHTML}</strong>` : element.innerHTML
    element.innerHTML = (useItalics) ? `<em>${element.innerHTML}</em>` : element.innerHTML
    
    return Html.toString(element)
  }

  const isBold = () => {
    const metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    return Html.hasTag(element, 'strong') || metadata.fontWeight === 'bold'
  }

  const isItalicized = () => {
    const metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    return Html.hasTag(element, 'em') || metadata.fontStyle === 'italic'
  }

  const handleBoldToggle = () => {
    setUseBold(!useBold)
  }

  const handleItalicsToggle = () => {
    setUseItalics(!useItalics)
  }

  const handleSubmit = () => {
    if (checkboxErrors.length > 0) {
      return
    }
    let issue = activeIssue
    issue.newHtml = Contrast.convertHtmlRgb2Hex(issue.newHtml)
    handleIssueSave(issue)
  }

  const cssEmphasisIsValid = (issue) => {
    if (issue.scanRuleId === 'CssTextStyleEmphasize') {
      if (!useBold && !useItalics) {
        return false
      }
    }
    return true
  }

  const checkFormErrors = () => {
    let tempErrors = []
    if(!cssEmphasisIsValid(activeIssue)) {
      tempErrors.push({ text: t('form.emphasis.msg.required'), type: 'error' })
    }
    setCheckboxErrors(tempErrors)
  }

  return (
    <>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="boldCheckbox"
          name="boldCheckbox"
          checked={useBold}
          onChange={handleBoldToggle} />
        <label htmlFor="boldCheckbox">{t('form.emphasis.label.bold')}</label>
      </div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="italicCheckbox"
          name="italicCheckbox"
          checked={useBold}
          onChange={handleItalicsToggle} />
        <label htmlFor="italicCheckbox">{t('form.emphasis.label.italic')}</label>
      </div>
      <FormFeedback issues={checkboxErrors} />
      <div className="flex-row justify-content-start mt-3 mb-3">
        <button className="btn btn-primary" disabled={textInputErrors.length > 0} onClick={handleSubmit}>{t('form.submit')}</button>
      </div>
    </>
  )
}