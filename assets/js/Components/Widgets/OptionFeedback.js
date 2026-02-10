import React from 'react'
import SeverityIssueIcon from '../Icons/SeverityIssueIcon'
import SeverityPotentialIcon from '../Icons/SeverityPotentialIcon'

export default function OptionFeedback ({
    feedbackArray
}) {

  return (
    <>
      { feedbackArray && feedbackArray.length > 0 && (
        <div className="pt-2">
          { feedbackArray.map((feedback, index) => 
            <div key={index} className="option-feedback">
              {feedback.type === 'error' && (
                <SeverityIssueIcon className="icon-md color-issue align-self-top pe-2"/>
              )}
              {feedback.type === 'warning' && (
                <SeverityPotentialIcon className="icon-md color-potential align-self-top pe-2"/>
              )}
              <div className={feedback.type === 'error' ? 'color-issue' : 'color-potential'}>{feedback.text}</div>
            </div>
          )}
        </div>
      )}    
    </>
  )
}