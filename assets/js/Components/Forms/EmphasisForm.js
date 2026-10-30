import React, { useState, useEffect } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import ToggleSwitch from '../Widgets/ToggleSwitch'
import * as Html from '../../Services/Html'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function EmphasisForm({
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
    ADD_EMPHASIS: UFIXIT_OPTIONS.ADD_EMPHASIS,
    MARK_AS_REVIEWED: UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  const [useBold, setUseBold] = useState(false)
  const [useItalics, setUseItalics] = useState(false)
  const [removeColor, setRemoveColor] = useState(false)

  const STYLE_ATTRIBUTES = ['color:', 'background:', 'background-color:', 'background-image:']
  const CHILD_TAGS = ['span', 'div', 'p', 'strong', 'em', 'b', 'i', 'u']

  const isBold = (element) => {
    const metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {}
    return Html.getChild(element, 'strong') || Html.getChild(element, 'b') || metadata.fontWeight === 'bold'
  }

  const isItalicized = (element) => {
    const metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {}
    return Html.getChild(element, 'em') || Html.getChild(element, 'i') || metadata.fontStyle === 'italic'
  }

  const hasStyleColor = (element) => {
    return Html.elementOrChildrenHasStyleAttributes(element, STYLE_ATTRIBUTES, CHILD_TAGS)
  }

  useEffect(() => {
    if(!activeIssue) {
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    const bold = isBold(element)
    const italicized = isItalicized(element)
    const styleColor = hasStyleColor(element)

    setUseBold(bold)
    setUseItalics(italicized)
    setRemoveColor(!styleColor)

    const fixed = activeIssue.newHtml && activeIssue.status > 0;
    const reviewed = Html.hasClass(element, activeIssue.ignoreClass);
    let startingOption = '';

    if (reviewed) {
      startingOption = FORM_OPTIONS.MARK_AS_REVIEWED;
    }
    if (fixed) {
      if (bold || italicized) {
        startingOption = FORM_OPTIONS.ADD_EMPHASIS;
      }
    }
    setActiveOption(startingOption);

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, useBold, useItalics, removeColor])

  const updateHtmlContent = () => {
    let issue = activeIssue

    let element = Html.toElement(issue.initialHtml)

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      if (removeColor) {
        Html.removeStyleAttributesFromElementAndChildren(element, STYLE_ATTRIBUTES, CHILD_TAGS)
      }
      issue.newHtml = Html.toString(element)
      handleActiveIssue(issue)
      return
    }

    // Clean up tags
    Html.removeTag(element, 'strong')
    Html.removeTag(element, 'em')

    if (useItalics) {
      element.innerHTML = `<em>${element.innerHTML}</em>`
    }
    if (useBold) {
      element.innerHTML = `<strong>${element.innerHTML}</strong>`  
    }

    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.ADD_EMPHASIS]: [],
    }

    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    if(activeOption === FORM_OPTIONS.ADD_EMPHASIS) {
      if(!isBold(element) && !isItalicized(element)) {
        tempErrors[FORM_OPTIONS.ADD_EMPHASIS].push({ text: t('form.emphasis.msg.required'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  return (
    <>
      {/* OPTION 1: Add label. ID: "ADD_EMPHASIS" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ADD_EMPHASIS ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ADD_EMPHASIS}
          labelText = {t('form.emphasis.decision.emphasis')}
        />
        { activeOption === FORM_OPTIONS.ADD_EMPHASIS && (
          <>
            <div className="instructions mb-2">{t('form.emphasis.label.select_emphasis')}</div>
            <label>
              <ToggleSwitch
                initialValue={useBold}
                updateToggle={setUseBold}
                disabled={isDisabled}
              />
              <div>{t('form.emphasis.label.bold')}</div>
            </label>
            <label className="mt-2">
              <ToggleSwitch
                initialValue={useItalics}
                updateToggle={setUseItalics}
                disabled={isDisabled}
              />
              <div>{t('form.emphasis.label.italic')}</div>
            </label>
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.ADD_EMPHASIS]}
            />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Reviewed. ID: "MARK_AS_REVIEWED" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_AS_REVIEWED}
          labelText = {t('form.emphasis.decision.no_emphasis')}
        />
        { activeOption === FORM_OPTIONS.MARK_AS_REVIEWED && (
          <>
            <label className="flex-row justify-content-start gap-2">
              <ToggleSwitch
                initialValue={removeColor}
                updateToggle={setRemoveColor}
                disabled={isDisabled}
              />
              <div>{t('form.emphasis.label.remove_color')}</div>
            </label>
          </>
        )}
      </div>
    </>
  )
}