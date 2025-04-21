import React, { useState, useEffect } from 'react'
import SeverityIcon from '../Icons/SeverityIcon'

export default function FormFeedback({
  issues
}) {

  const [formattedIssues, setFormattedIssues] = useState([])

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
    issues.forEach((issue) => {
      if(issueTypeMap[issue.type]) {
        tempIssues.push({
          text: issue.text,
          type: issueTypeMap[issue.type]
        })
      }
      else {
        tempIssues.push({
          text: issue.text,
          type: 'ISSUE'
        })
      }
    })
    setFormattedIssues(tempIssues)
  }, [issues])
  
  return (
    <>
      { formattedIssues.length > 0 && (
        <div className="flex-column mt-2">
          {formattedIssues.map((issue, index) => (
            <div className="flex-row justify-content-end gap-1" key={index}>
              <div className="flex-column flex-center">
                <SeverityIcon type={issue.type} className="icon-sm" />
              </div>
              <div className="flex-column flex-center">
                <div className="error-text">{issue.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}