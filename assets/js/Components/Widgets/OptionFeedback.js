import React from 'react'
import SeverityIssueIcon from '../Icons/SeverityIssueIcon'
import SeverityPotentialIcon from '../Icons/SeverityPotentialIcon'

export default function OptionFeedback ({
  t,
  feedbackArray
}) {

  return (
    <>
      { feedbackArray && feedbackArray.length > 0 && (
        <div className="pt-2">
          { feedbackArray.map((feedback, index) => 
            <div
              key={index}
              className={`option-feedback ${feedback.type === 'error' ? 'feedback-error' : 'feedback-warning'}`}
              aria-label={t(feedback.type === 'error' ? 'fix.label.feedback_error' : 'fix.label.feedback_caution', {message: feedback.text})}
              role="presentation"
              >
              {feedback.type === 'error' && (
                <SeverityIssueIcon className="icon-md udoit-issue-highlight align-self-top pe-2" aria-hidden="true"/>
              )}
              {feedback.type === 'warning' && (
                <SeverityPotentialIcon className="icon-md udoit-potential-highlight align-self-top pe-2" aria-hidden="true"/>
              )}
              <div aria-hidden="true">{feedback.text}</div>
            </div>
          )}
        </div>
      )}    
    </>
  )
}