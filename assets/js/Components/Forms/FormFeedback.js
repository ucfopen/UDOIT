import React, { useState, useEffect } from 'react'

import FixedIcon from '../Icons/FixedIcon'

export default function FormFeedback({
  t,
  handleSubmit = null,
  activeIssue = null,
  settings = null,
  activeContentItem = null,
  isDisabled = false,
  formErrors = [],
}) {

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
  
  return (
    <div className="flex-row justify-content-between gap-1 mt-4">
      { !handleSubmit && activeContentItem?.url && (
        <a href={activeContentItem.url} 
           className="btn btn-secondary"
           target="_blank"
           rel="noopener noreferrer"
           tabindex="0">
          {t('fix.button.lms_solve')}
        </a>
      )}
      <div className="flex-column justify-content-start flex-shrink-0">
        { handleSubmit && (
          <button
            className="btn-primary"
            disabled={isDisabled || hasErrors}
            tabindex="0"
            onClick={handleSubmit}>
            {t('form.submit')}
          </button>
        )}
      </div>
      <div className="flex-column justify-content-start flex-grow-1 gap-1">
        { (activeIssue.status === 1 || activeIssue.status === 3) && (
            <div className="flex-row justify-content-start mt-1">
              <div className="data-pill fixed flex-row">
                <FixedIcon className="color-success icon-md flex-column align-self-center"/>
                <div className="data-pill-text">{t('filter.label.resolution.fixed_single')}</div>
              </div>
            </div>
          ) }
        { formattedIssues.length > 0 && (
          <>
            {formattedIssues.map((issue, index) => (
              <div className="flex-row justify-content-end gap-1" key={index}>
                <div className="error-text text-end">{issue.text}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}