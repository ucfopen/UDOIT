import React, { useEffect, useState } from 'react'
import FormExternalLink from './FormExternalLink'
import RadioSelector from '../Widgets/RadioSelector'

export default function UfixitReviewOnly({
  t,
  settings, 
  activeIssue,
  isDisabled,
  activeOption,
  setActiveOption,
  setFormErrors
}) {

  const FORM_OPTIONS = {
    FIX_IN_LMS: settings.UFIXIT_OPTIONS.FIX_IN_LMS,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  useEffect(() => {
    if (!activeIssue) {
      return
    }

    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3)
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)
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
    if(activeOption === FORM_OPTIONS.FIX_IN_LMS) {
      setFormErrors({ [FORM_OPTIONS.FIX_IN_LMS]: [{ text: t('form.review_only.link.edit'), type: 'error' }] })
    }
    else {
      setFormErrors({})
    }
  }, [activeOption])

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
              settings={settings}
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