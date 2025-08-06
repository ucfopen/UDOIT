import React, { useState, useEffect } from 'react'
import ResolvedIcon from '../Icons/ResolvedIcon'
import SaveIcon from '../Icons/SaveIcon'

export default function FormReviewOnly({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isContentLoading,
  markAsReviewed,
  setMarkAsReviewed
}) {

  const [markAsReviewedLocal, setMarkAsReviewedLocal] = useState(markAsReviewed)

  useEffect(() => {
    setMarkAsReviewedLocal(markAsReviewed)
  }, [markAsReviewed])

  const handleMarkAsReviewed = () => {
    setMarkAsReviewed(!markAsReviewed)
  }

  return (
    <>
      <div className="separator mt-2">{t('fix.label.or')}</div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input
          type="checkbox"
          id="markAsReviewedCheckbox"
          name="markAsReviewedCheckbox"
          tabIndex="0"
          disabled={isContentLoading}
          checked={markAsReviewedLocal}
          onChange={() => handleMarkAsReviewed()} />
        <label htmlFor="markAsReviewedCheckbox" className="instructions">{t('fix.label.no_changes')}</label>
      </div>
      <div className="instructions-helper">{t('fix.label.no_changes_desc')}</div>
      <div className="flex-row justify-content-between gap-1 mt-3">
        <div className="flex-column justify-content-center flex-grow-1 gap-1">
          { (activeIssue.status === 2 || activeIssue.status === 3) ? (
              <div className="flex-row justify-content-end pe-2">
                <ResolvedIcon className="color-success icon-md flex-column align-self-center pe-2"/>
                <div className="flex-column align-self-center fw-bolder primary">{t('filter.label.resolution.resolved_single')}</div>
              </div>
            ) : ''}
        </div>
        <div className="flex-column justify-content-center flex-shrink-0">
          <button
            className="btn-primary btn-icon-left"
            onClick={() => handleIssueSave(activeIssue, markAsReviewed)}
            disabled={isContentLoading || !markAsReviewed}
            tabIndex="0">
            <SaveIcon className="icon-md" alt=""/>
            {t('form.submit')}
          </button>
        </div>
      </div>
    </>
  )
}