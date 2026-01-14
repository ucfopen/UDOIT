import React, { useState, useEffect } from 'react'
import CloseIcon from '../Icons/CloseIcon'
import DisabilityCognitiveIcon from '../Icons/DisabilityCognitiveIcon'
import DisabilityHearingIcon from '../Icons/DisabilityHearingIcon'
import DisabilityMotorIcon from '../Icons/DisabilityMotorIcon'
import DisabilityVisualIcon from '../Icons/DisabilityVisualIcon'
import FormClarification from '../Forms/FormClarification'
import { disabilityTypes, disabilitiesFromRule, formNameFromRule } from '../../Services/Ufixit'
import './UfixitWidget.css'


export default function BarrierInformation ({
  t,
  settings,

  tempActiveIssue,
  handleLearnMoreClick
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

    if(tempActiveIssue.contentType === settings.ISSUE_FILTER.FILE_OBJECT) {
      setFormSummary(t('form.file.summary'))
      setShowLearnMore(true)
    }
    else {
      let tempFormName = formNameFromRule(tempActiveIssue.scanRuleId)
      if(tempFormName === 'review_only') {
        let ruleSummary = t(`rule.summary.${tempActiveIssue.scanRuleId}`)
        if(ruleSummary === `rule.summary.${tempActiveIssue.scanRuleId}`) {
          ruleSummary = formatEqualAccessMessage()
        }
        setFormSummary(ruleSummary)

        let ruleLearnMore = t(`rule.desc.${tempActiveIssue.scanRuleId}`)
        if(ruleLearnMore === `rule.desc.${tempActiveIssue.scanRuleId}`) {
          setShowLearnMore(false)
        }
        else {
          setShowLearnMore(true)
        }
      }
      else {
        setFormSummary(t(`form.${tempFormName}.summary`))
        setShowLearnMore(true)
      }
    }
  }, [tempActiveIssue])

  return (
    <>
      <div className="callout-container help-container flex-shrink-0">
        <div className="flex-row gap-2">
          <div className="ufixit-instructions" 
            dangerouslySetInnerHTML={{__html: formSummary}}
          />
        
          { showLearnMore && (
            <button id="btn-learn-more-open" className="btn-secondary align-self-start flex-shrink-0" onClick={() => handleLearnMoreClick()} >
              <div>{t('fix.button.learn_more')}</div>
            </button>
          )}
        </div>
        <FormClarification
          t={t}
          activeIssue={tempActiveIssue}
        />
      </div>
    </>
  )
}