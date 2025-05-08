import React, { useState, useEffect } from 'react'
import { formNameFromRule } from '../../Services/Ufixit'
import InfoIcon from '../Icons/InfoIcon'

export default function FormClarification({
  t,
  activeIssue
}) {
  const [clarification, setClarification] = useState('')

  useEffect(() => {
    if(activeIssue) {
      // Compute what additional clarification text to show, if any.
      // First priority: Rule-specific descriptions from the translation file.
      const clarificationTag = 'rule.desc.' + activeIssue.scanRuleId
      const clarification = t(clarificationTag)

      if(clarification !== clarificationTag) {
        setClarification(clarification)
        return
      }
      
      // If there isn't a specific description from us, check for one in the 
      const formName = formNameFromRule(activeIssue.scanRuleId)
      if(formName === 'review_only') {
        // There may be specific (ENGLISH-ONLY) text from the Equal Access scan.
        const metadata = activeIssue?.issueData?.metadata ? JSON.parse(activeIssue.issueData.metadata) : {}
        if(metadata.message && metadata.message !== "") {
          setClarification(metadata.message)
          return
        }
      }
      setClarification('')
    }
    else {
      setClarification('')
    }
  }, [activeIssue])

  return (
    <>
      { (clarification !== '') && (
        <div className="clarification-container flex-row mb-3 gap-2">
          <div className="flex-column justify-content-start">
            <InfoIcon className="icon-lg link-color" alt="" />
          </div>
          <div className="flex-column justify-content-center">
            <div className="clarification-text">{clarification}</div>
          </div>
        </div>
      )}
    </>
  )
}