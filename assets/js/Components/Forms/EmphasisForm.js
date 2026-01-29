import React, { useState, useEffect } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
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
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
}) {

  const FORM_OPTIONS = {
    ADD_EMPHASIS: settings.UFIXIT_OPTIONS.ADD_EMPHASIS,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  const [useBold, setUseBold] = useState(false)
  const [useItalics, setUseItalics] = useState(false)
  const [removeColor, setRemoveColor] = useState(false)

  const STYLE_ATTRIBUTES = ['color:', 'background:', 'background-color:', 'background-image:']
  const CHILD_TAGS = ['span', 'div', 'p', 'strong', 'em', 'b', 'i', 'u']

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
    return Html.elementOrChildrenHasStyleAttributes(element, STYLE_ATTRIBUTES, CHILD_TAGS)
  }

  useEffect(() => {
    if(!activeIssue) {
      return
    }

    const bold = isBold()
    const italicized = isItalicized()
    const styleColor = hasStyleColor()
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)

    if (reviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else if (bold || italicized || !styleColor) {
      setActiveOption(FORM_OPTIONS.ADD_TEXT)
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
  }, [useBold, useItalics, removeColor, activeOption])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    let element = Html.toElement(issue.initialHtml)

    // Clean up tags
    Html.removeTag(element, 'strong')
    Html.removeTag(element, 'em')

    if (removeColor) {
      Html.removeStyleAttributesFromElementAndChildren(element, STYLE_ATTRIBUTES, CHILD_TAGS)
    }
    if(useItalics) {
      element.innerHTML = `<em>${element.innerHTML}</em>`
    }
    if(useBold) {
      element.innerHTML = `<strong>${element.innerHTML}</strong>`  
    }
    
    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_EMPHASIS]: [],
    }

    if(activeOption === FORM_OPTIONS.ADD_EMPHASIS) {
      if(!isBold() && !isItalicized() && hasStyleColor()) {
        tempErrors[FORM_OPTIONS.ADD_EMPHASIS].push({ text: t('form.emphasis.msg.required'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  return (
    <>
      {/* OPTION 1: Add label. ID: "add-emphasis" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_EMPHASIS ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_EMPHASIS}
          labelText = {t('form.emphasis.label.select_emphasis')}
          />
        {activeOption === FORM_OPTIONS.ADD_EMPHASIS && (
          <>
            <div className="flex-row justify-content-start gap-1">
              <ToggleSwitch
                labelId="boldCheckbox"
                initialValue={useBold}
                updateToggle={setUseBold}
                disabled={isDisabled}
                small={true} />
              <label htmlFor="boldCheckbox" className="ufixit-instructions">{t('form.emphasis.label.bold')}</label>
            </div>
            <div className="flex-row justify-content-start gap-1 mt-2">
              <ToggleSwitch
                labelId="italicCheckbox"
                initialValue={useItalics}
                updateToggle={setUseItalics}
                disabled={isDisabled}
                small={true} />
              <label htmlFor="italicCheckbox" className="ufixit-instructions">{t('form.emphasis.label.italic')}</label>
            </div>
            <div className="flex-row justify-content-start gap-1 mt-2">
              <ToggleSwitch
                labelId="removeColorCheckbox"
                initialValue={removeColor}
                updateToggle={setRemoveColor}
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
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_AS_REVIEWED}
          labelText = {t('fix.label.no_changes')}
          />
      </div>
    </>
  )
}