import React, { useState, useEffect } from 'react'
import { formNameFromRule } from '../../Services/Ufixit'
import { ISSUE_FILTER } from '../../Services/Constants'
import InfoIcon from '../Icons/InfoIcon'

export default function DecisionQuestion ({
  t,
  tempActiveIssue,
  handleLearnMoreClick,

}) {

  const [formSummary, setFormSummary] = useState('')
  const [showLearnMore, setShowLearnMore] = useState(false)
  
  const formatEqualAccessMessage = () => {
    if(!tempActiveIssue || !tempActiveIssue.issueData || !tempActiveIssue.issueData.metadata) {
      return ''
    }
    const metadata = JSON.parse(tempActiveIssue.issueData.metadata)
    if(!metadata.message || metadata.message === '') {
      return ''
    }
    let message = metadata.message
    if(metadata.messageArgs && metadata.messageArgs.length > 0) {
      for(let i = 0; i < metadata.messageArgs.length; i++) {
        message = message.replace(`{${i}}`, metadata.messageArgs[i])
      }
    }
    message = message.replaceAll('<', '&lt;')
    message = message.replaceAll('>', '&gt;')
    message = message.replaceAll('&lt;', '<code>&lt;')
    message = message.replaceAll('&gt;', '&gt;</code>')
    return message
  }

  useEffect(() => {
    if(!tempActiveIssue) {
      return
    }

    let tempFormName = formNameFromRule(tempActiveIssue.scanRuleId)

    if(tempFormName === 'review_only') {
      let ruleSummary = t(`rule.summary.${tempActiveIssue.scanRuleId}`)
      if(ruleSummary === `rule.summary.${tempActiveIssue.scanRuleId}`) {
        ruleSummary = formatEqualAccessMessage()
      }
      setFormSummary(ruleSummary)

      let ruleLearnMoreKey = `rule.desc.${tempActiveIssue.scanRuleId}`
      let ruleLearnMore = t(ruleLearnMoreKey)
      if(ruleLearnMore === ruleLearnMoreKey) {
        setShowLearnMore(false)
      }
      else {
        setShowLearnMore(true)
      }
    }
    else {
      let tempDecisionQuestionKey = `form.${tempFormName}.decision`;
      let tempDecisionQuestion = t(tempDecisionQuestionKey);

      if (tempDecisionQuestionKey === tempDecisionQuestion) {
        setFormSummary(t(`form.${tempFormName}.summary`));
        setShowLearnMore(true);
      }
      else {
        setFormSummary(tempDecisionQuestion);
        setShowLearnMore(false);
      }
    }
  }, [tempActiveIssue])

  return (
    <>
      <div className="callout-container decision-container mb-3">
        <div className="ufixit-instructions" 
          dangerouslySetInnerHTML={{__html: formSummary}}
        />
        { showLearnMore && (
          <button
            id="decide-button"
            className="btn-text btn-icon-left btn-small mt-2 flex-row justify-self-end"
            onClick={() => handleLearnMoreClick()} >
              <InfoIcon className="icon-md link-color" alt="" aria-hidden="true" />
            <div>{t('fix.button.learn_more')}</div>
          </button>
        )}
      </div>
    </>
  )
}