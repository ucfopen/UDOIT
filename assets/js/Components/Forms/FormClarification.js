import React, { useState, useEffect } from 'react'
import { formNameFromRule } from '../../Services/Ufixit'
import InfoIcon from '../Icons/InfoIcon'

export default function FormClarification({
  t,
  activeIssue
}) {
  const [clarification, setClarification] = useState('')

  useEffect(() => {
    if(!activeIssue) {
      setClarification('')
      return
    }
  
    // Compute what additional clarification text to show, if any.
    // First priority: Rule-specific descriptions from the translation file.
    const clarificationTag = 'rule.info.' + activeIssue.scanRuleId
    let messageArgs = {}
    if(activeIssue?.issueData?.metadata) {
      let metadata = JSON.parse(activeIssue.issueData.metadata)
      if(activeIssue.scanRuleId === 'text_quoted_correctly') {
        let quoteList = metadata.messageArgs.join(', ')
        messageArgs = { 'potentialQuotes': quoteList }
      }
      if(activeIssue.scanRuleId === 'aria_role_valid') {
        messageArgs = { 'tagName': metadata.messageArgs[1], 'ariaRole': metadata.messageArgs[0] }
      }
      if(activeIssue.scanRuleId === 'aria_attribute_redundant') {
        messageArgs = { 'htmlAttribute': metadata.messageArgs[1], 'ariaAttribute': metadata.messageArgs[0] }
      }
    }

    const clarification = t(clarificationTag, messageArgs)

    if(clarification !== clarificationTag) {
      setClarification(clarification)
      return
    }
    
    // // If there isn't a specific description from us, check for one in the metadata from the scan issue.
    // const formName = formNameFromRule(activeIssue.scanRuleId)
    // if(formName === 'review_only') {
    //   // There may be specific (ENGLISH-ONLY) text from the Equal Access scan.
    //   const metadata = activeIssue?.issueData?.metadata ? JSON.parse(activeIssue.issueData.metadata) : {}
    //   if(metadata.message && metadata.message !== "") {
    //     setClarification(metadata.message)
    //     return
    //   }
    // }
    setClarification('')
    
  }, [activeIssue])

  return (
    <>
      { (clarification !== '') && (
        <div className="flex-grow-0">  
          <div className="clarification-container flex-row mb-2 gap-2">
            <div className="flex-column justify-content-start">
              <InfoIcon className="icon-lg udoit-suggestion" alt="" />
            </div>
            <div className="flex-column justify-content-center">
              <div className="clarification-text" dangerouslySetInnerHTML={{__html: clarification}} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}