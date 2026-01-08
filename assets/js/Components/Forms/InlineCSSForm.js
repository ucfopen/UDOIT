import React, { useState, useEffect } from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'
import { getIssueHtml } from '../../Services/Html'

export default function InlineCSSForm ({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed
 }) {

  const [isStyleToggleChecked, setisStyleToggleChecked] = useState(false)
  const [isImportantToggleChecked, setIsImportantToggleChecked] = useState(false)

  const [formErrors, setFormErrors] = useState([])

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

  const handleRemoveInlineStylesCheck = () => {
    setisStyleToggleChecked(!isStyleToggleChecked)
  }

  const handleImportantCheckbox = () => {
    setIsImportantToggleChecked(!isImportantToggleChecked)
  }

  useEffect (() =>   {
    updateHtmlContent()
    checkFormErrors()
  }, [isStyleToggleChecked, isImportantToggleChecked, markAsReviewed])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

    if (markAsReviewed) {
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

  const checkFormErrors = () => {
    let tempErrors = []

    if(!isStyleToggleChecked && !isImportantToggleChecked){
      tempErrors.push({text:'', type: 'error'})
    }

    setFormErrors(tempErrors)
  }

  const removeInlineStyles = () => {
    let tempstyles = getInlineCSS()

    if(isStyleToggleChecked){
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

    if(isImportantToggleChecked){
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

  const updateCheckboxes = () => {
    let tempstyles = getInlineCSS()

    let isInStylesLH = tempstyles.findIndex(item => item.includes("line-height"));
    let isInStylesWS = tempstyles.findIndex(item => item.includes("word-spacing"));
    let isInStylesLS = tempstyles.findIndex(item => item.includes("letter-spacing"));
    let tempimp = "!important"

    if((isInStylesLH<=-1 && isInStylesWS<=-1 && isInStylesLS<=-1)){
      setisStyleToggleChecked(true)
    }
    else{
      setisStyleToggleChecked(false)
    }

    if(
      (tempstyles[isInStylesLH]?.includes(tempimp))||
      (tempstyles[isInStylesWS]?.includes(tempimp))||
      (tempstyles[isInStylesLS]?.includes(tempimp))) {
      setIsImportantToggleChecked(false)
    }
    else{
      setIsImportantToggleChecked(true)
    }
  }

  useEffect(() => {
    if (!activeIssue) {
      return
    }

    updateCheckboxes()
    checkFormErrors()
  }, [activeIssue])

  const handleSubmit = () => {
    if (markAsReviewed || formErrors.length === 0) {
      handleIssueSave(activeIssue)
    }
  }

  return (
    <>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input
          type="checkbox"
          id="removeInlineStylesCheck"
          name="removeInlineStylesCheck"
          tabIndex="0"
          disabled={isDisabled}
          checked={isStyleToggleChecked}
          onChange={handleRemoveInlineStylesCheck} />
        <label htmlFor="removeInlineStylesCheck" className="instructions">{t('form.invalid_css.label.remove_style')}</label>
      </div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input
          type="checkbox"
          id="removeImportantStylesCheck"
          name="removeImportantStylesCheck"
          tabIndex="0"
          disabled={isDisabled}
          checked={isImportantToggleChecked}
          onChange={handleImportantCheckbox} />
        <label htmlFor="removeImportantStylesCheck" className="instructions">{t('form.invalid_css.label.remove_important')}</label>
      </div>
      <FormSaveOrReview
        t={t}
        settings={settings}
        activeIssue={activeIssue}
        isDisabled={isDisabled}
        handleSubmit={handleSubmit}
        formErrors={formErrors}
        markAsReviewed={markAsReviewed}
        setMarkAsReviewed={setMarkAsReviewed} />
    </>
  )
}
