import React, { useEffect } from 'react'
import { UFIXIT_OPTIONS } from '../../Services/Constants'
import FormExternalLink from './FormExternalLink'
import RadioSelector from '../Widgets/RadioSelector'
import * as Html from '../../Services/Html'

export default function UfixitReviewOnly({
  t,
  activeIssue,
  instanceInfo,
  handleActiveIssue,
  isDisabled,
  activeOption,
  setActiveOption,
  setFormErrors
}) {

  const FORM_OPTIONS = {
    FIX_IN_LMS: UFIXIT_OPTIONS.FIX_IN_LMS,
    MARK_AS_REVIEWED: UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  useEffect(() => {
    if (!activeIssue) {
      return
    }

    const fixed = activeIssue.newHtml && activeIssue.status > 0;
    const reviewed = Html.hasClass(activeIssue.newHtml, activeIssue.ignoreClass);
    let startingOption = ''

    if (reviewed){
      startingOption = FORM_OPTIONS.MARK_AS_REVIEWED
    }
    else if (fixed) {
      startingOption = FORM_OPTIONS.FIX_IN_LMS
    }
    setActiveOption(startingOption)

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption])

  const updateHtmlContent = () => {
    let issue = activeIssue;
    const html = Html.getIssueHtml(issue);
    let element = Html.toElement(html);

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      Html.addClass(element, issue.ignoreClass);
    }
    else {
      Html.removeClass(element, issue.ignoreClass);
    }

    issue.newHtml = Html.toString(element);
    handleActiveIssue(issue);
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.FIX_IN_LMS]: []
    }

    if(activeOption === FORM_OPTIONS.FIX_IN_LMS) {
      tempErrors[FORM_OPTIONS.FIX_IN_LMS].push({ text: t('form.review_only.link.edit'), type: 'error' })
    }

    setFormErrors(tempErrors)
  }

  return (
    <>
      {/* OPTION 1: Fix in LMS. ID: "FIX_IN_LMS" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.FIX_IN_LMS ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.FIX_IN_LMS}
          labelText = {t('form.review_only.link.edit')}
          />

        {activeOption === FORM_OPTIONS.FIX_IN_LMS && (
          <>
            <div className="instructions">
              {t('form.review_only.summary')}
            </div>
            <FormExternalLink
              t={t}
              instanceInfo={instanceInfo}
              activeIssue={activeIssue}
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
          labelText = {t('fix.label.no_changes')}
          />
      </div>
    </> 
  )
}