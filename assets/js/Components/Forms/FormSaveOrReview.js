import React, { useState, useEffect } from 'react'

import SaveIcon from '../Icons/SaveIcon'
import FixedIcon from '../Icons/FixedIcon'
import ResolvedIcon from '../Icons/ResolvedIcon'

export default function FormSaveOrReview({
  t,
  handleSubmit = null,
  activeIssue = null,
  settings = null,
  activeContentItem = null,
  isDisabled = false,
  formErrors = [],
  markAsReviewed,
  setMarkAsReviewed
}) {

  const [markAsReviewedLocal, setMarkAsReviewedLocal] = useState(markAsReviewed)
  const [formattedIssues, setFormattedIssues] = useState([])
  const [hasErrors, setHasErrors] = useState(false)

  const issueTypeMap = {
    'error': 'ISSUE',
    'ERROR': 'ISSUE',
    'issue': 'ISSUE',
    'ISSUE': 'ISSUE',
    'warning': 'POTENTIAL',
    'WARNING': 'POTENTIAL',
    'potential': 'POTENTIAL',
    'POTENTIAL': 'POTENTIAL',
    'info': 'SUGGESTION',
    'INFO': 'SUGGESTION',
    'suggestion': 'SUGGESTION',
    'SUGGESTION': 'SUGGESTION',
  }

  useEffect(() => {
    let tempIssues = []
    let tempHasErrors = false
    formErrors.forEach((issue) => {
      if(issueTypeMap[issue.type]) {
        tempIssues.push({
          text: issue.text,
          type: issueTypeMap[issue.type]
        })
        if(issueTypeMap[issue.type] === 'ISSUE') {
          tempHasErrors = true
        }
      }
      else {
        tempIssues.push({
          text: issue.text,
          type: 'ISSUE'
        })
        tempHasErrors = true
      }
    })
    setFormattedIssues(tempIssues)
    setHasErrors(tempHasErrors)
  }, [formErrors])

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
          disabled={isDisabled && !markAsReviewed}
          checked={markAsReviewedLocal}
          onChange={() => handleMarkAsReviewed()} />
        <label htmlFor="markAsReviewedCheckbox" className="instructions">{t('fix.label.no_changes')}</label>
      </div>
      <div className="instructions-helper">{t('fix.label.no_changes_desc')}</div>

      <div className="flex-row justify-content-between gap-1 mt-4">
        <div className="flex-column justify-content-center flex-grow-1 gap-1">
          { (activeIssue.status === 1 || activeIssue.status === 3) ? (
              <div className="flex-row justify-content-end pt-2 pe-2">
                <FixedIcon className="color-success icon-md flex-column align-self-center pe-2"/>
                <div className="flex-column align-self-center fw-bolder primary">{t('filter.label.resolution.fixed_single')}</div>
              </div>
            ) : activeIssue.status === 2 ? (
              <div className="flex-row justify-content-end pe-2">
                <ResolvedIcon className="color-success icon-md flex-column align-self-center pe-2"/>
                <div className="flex-column align-self-center fw-bolder primary">{t('filter.label.resolution.resolved_single')}</div>
              </div>
            ) : (formattedIssues.length > 0 && !markAsReviewed) ? (
              <>
                {formattedIssues.map((issue, index) => (
                  <div className="flex-row justify-content-start gap-1" key={index}>
                    <div className="error-text">{issue.text}</div>
                  </div>
                ))}
              </>
            ) : ''}
        </div>
        { !handleSubmit && activeContentItem?.url && (
          <a href={activeContentItem.url} 
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
            tabIndex="0">
            {t('fix.button.lms_solve')}
          </a>
        )}
        <div className="flex-column justify-content-start flex-shrink-0">
          { handleSubmit && (
            <button
              className="btn-primary btn-icon-left"
              disabled={!markAsReviewed && (isDisabled || hasErrors)}
              tabIndex="0"
              onClick={handleSubmit}>
                <SaveIcon className="icon-md" />
              {t('form.submit')}
            </button>
          )}
        </div>
      </div>
    </>
  )
}