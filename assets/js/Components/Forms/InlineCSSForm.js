import React, { useState, useEffect } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import * as Html from '../../Services/Html'
import { getIssueHtml } from '../../Services/Html'

export default function InlineCSSForm ({
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
    REMOVE_STYLING: settings.UFIXIT_OPTIONS.DELETE_ATTRIBUTE,
    DEEMPHASIZE_STYLING: settings.UFIXIT_OPTIONS.EDIT_ATTRIBUTE,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  const getInlineCSS = () => {
    let html = activeIssue.sourceHtml
    if(activeIssue.status > 0 && activeIssue.newHtml){
      html = activeIssue.newHtml
    }

    let element = Html.toElement(html)

    let elementInlineCSS = element.style;
    let elementInlineCSSText = elementInlineCSS.cssText
    elementInlineCSSText = elementInlineCSSText.split(";")
    return elementInlineCSSText
  }

  useEffect (() =>   {
    updateHtmlContent()
  }, [activeOption])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    let html = getIssueHtml(activeIssue)
    let updatedElement = Html.toElement(html)

    let updatedInlineStyles = removeInlineStyles()

    updatedElement.setAttribute("style", updatedInlineStyles.join(';'))
    issue.newHtml = Html.toString(updatedElement)
    handleActiveIssue(issue)
  }

  const removeInlineStyles = () => {
    let tempstyles = getInlineCSS()

    if(activeOption === FORM_OPTIONS.REMOVE_STYLING){
      let isInStylesLH = tempstyles.findIndex(item => item.includes("line-height"));
      if(isInStylesLH>-1){
        tempstyles.splice(isInStylesLH, 1)
      }
      let isInStylesWS = tempstyles.findIndex(item => item.includes("word-spacing"));
      if(isInStylesWS>-1){
        tempstyles.splice(isInStylesWS, 1)
      }
      let isInStylesLS = tempstyles.findIndex(item => item.includes("letter-spacing"));
      if(isInStylesLS>-1){
        tempstyles.splice(isInStylesLS, 1)
      }
    }

    if(activeOption === FORM_OPTIONS.DEEMPHASIZE_STYLING){
      let isInStylesLH = tempstyles.findIndex(item => item.includes("line-height"));
      if(isInStylesLH>-1){
        tempstyles[isInStylesLH] =  tempstyles[isInStylesLH].replace('!important', '').trim()
      }
      let isInStylesWS = tempstyles.findIndex(item => item.includes("word-spacing"));
      if(isInStylesWS>-1){
        tempstyles[isInStylesWS] =  tempstyles[isInStylesWS].replace('!important', '').trim()
      }
      let isInStylesLS = tempstyles.findIndex(item => item.includes("letter-spacing"));
      if(isInStylesLS>-1){
        tempstyles[isInStylesLS] =  tempstyles[isInStylesLS].replace('!important', '').trim()
      }
    }

    return tempstyles
  }

  useEffect(() => {
    if (!activeIssue) {
      return
    }

    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)
    const fixed = activeIssue.newHtml && activeIssue.status === 1

    if (reviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else if (fixed) {

      let tempstyles = getInlineCSS()

      let isInStylesLH = tempstyles.findIndex(item => item.includes("line-height"));
      let isInStylesWS = tempstyles.findIndex(item => item.includes("word-spacing"));
      let isInStylesLS = tempstyles.findIndex(item => item.includes("letter-spacing"));
      
      if ((isInStylesLH<=-1 && isInStylesWS<=-1 && isInStylesLS<=-1)){
        setActiveOption(FORM_OPTIONS.REMOVE_STYLING)
      }

      else {
        
        let tempimp = "!important"
        if (!(
          (tempstyles[isInStylesLH]?.includes(tempimp))||
          (tempstyles[isInStylesWS]?.includes(tempimp))||
          (tempstyles[isInStylesLS]?.includes(tempimp)))) {
          setActiveOption(FORM_OPTIONS.DEEMPHASIZE_STYLING)
        }
        else {
          setActiveOption('')
        }
      }
    }
    else {
      setActiveOption('')
    }
  }, [activeIssue])

  return (
    <>
      {/* OPTION 1: Remove Styling. ID: "REMOVE_STYLING" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.REMOVE_STYLING ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.REMOVE_STYLING}
          labelText = {t('form.inline_css.label.remove_style')}
          />
      </div>

      {/* OPTION 2: Deemphasize Styling. ID: "DEEMPHASIZE_STYLING" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.DEEMPHASIZE_STYLING ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.DEEMPHASIZE_STYLING}
          labelText = {t('form.inline_css.label.remove_important')}
          />
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
    </>
  )
}
