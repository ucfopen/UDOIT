import React, { useState, useEffect } from 'react'

import FixedIcon from '../Icons/FixedIcon'

export default function FormFeedback({
  t,
  handleSubmit = null,
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
    <div className="flex-row justify-content-between gap-3 mt-4">
      { !handleSubmit && activeContentItem?.url && (
        <a href={activeContentItem.url} 
           className="btn btn-secondary"
           target="_blank"
           rel="noopener noreferrer"
           tabindex="0">
          {t('fix.button.lms_solve')}
        </a>
      )}
      { handleSubmit && (
        <>
          <div className="flex-column justify-content-start flex-shrink-0">
            <button
              className="btn-icon-left btn-primary"
              disabled={isDisabled || hasErrors}
              tabindex="0"
              onClick={handleSubmit}>
                <FixedIcon className="icon-md" />
              {t('form.submit')}
            </button>
          </div>
          { formattedIssues.length > 0 && (
            <div className="flex-column justify-content-start gap-1">
              {formattedIssues.map((issue, index) => (
                <div className="flex-row justify-content-end gap-1" key={index}>
                  <div className="error-text text-end">{issue.text}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}