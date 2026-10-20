import React, { useState, useEffect } from 'react'

import SeverityIcon from '../Icons/SeverityIcon'
import DisabilityCognitiveIcon from '../Icons/DisabilityCognitiveIcon'
import DisabilityHearingIcon from '../Icons/DisabilityHearingIcon'
import DisabilityMotorIcon from '../Icons/DisabilityMotorIcon'
import DisabilityVisualIcon from '../Icons/DisabilityVisualIcon'
import FixedIcon from '../Icons/FixedIcon'
import { ISSUE_FILTER } from '../../Services/Constants'
import { disabilityTypes, disabilitiesFromRule, formNameFromRule } from '../../Services/Ufixit'
import './IssueAffects.css'

export default function IssueAffects({
  t,
  issue,
}) {

  const [issueType, setIssueType] = useState('')
  const [disabilities, setDisabilities] = useState([])

  useEffect(() => {
    if (!issue) {
      return;
    }

    if (issue.status === ISSUE_FILTER.ACTIVE) {
      setIssueType(issue.severity);
    }
    else {
      setIssueType(ISSUE_FILTER.FIXED);
    }

    setDisabilities(disabilitiesFromRule(issue.scanRuleId))
  }, [issue])


  return (
    <>
      { issue && (
        <div className={'severity-header ' + issueType.toLowerCase()}>

          { issueType === ISSUE_FILTER.FIXED ? (
            <div className="severity-label">
              <FixedIcon className="color-success icon-md flex-column align-self-center" aria-hidden="true"/>
              <div>{t('filter.label.severity.resolved_single')}</div>
            </div>
          ) : (
            <div className="severity-label">
              <SeverityIcon type={issueType} className="icon-md flex-column align-self-center" aria-hidden="true" />
              <div>{t(`filter.label.severity.${issueType.toLowerCase()}_single`)}</div>
            </div>
          )}

          <div className="disability-icons">
            {disabilities.includes(disabilityTypes.VISUAL) && (  
              <>
                <a
                  href="javascript:void(0)"
                  tabIndex="0"
                  interestfor="define-visual-icon"
                  aria-labelledby="define-visual-icon"
                >
                  <DisabilityVisualIcon className="icon-md" alt=""/>
                </a>
                <div id="define-visual-icon" popover="hint" aria-hidden="true">{t('fix.label.affected', {'affected': t('fix.label.disability.visual')})}</div>
              </>
            )}
            {disabilities.includes(disabilityTypes.HEARING) && (  
              <>
                <a
                  href="javascript:void(0)"
                  tabIndex="0"
                  interestfor="define-hearing-icon"
                  aria-labelledby="define-hearing-icon"
                >
                  <DisabilityHearingIcon className="icon-md" alt=""/>
                </a>
                <div id="define-hearing-icon" popover="hint" aria-hidden="true">{t('fix.label.affected', {'affected': t('fix.label.disability.hearing')})}</div>
              </>
            )}
            {disabilities.includes(disabilityTypes.MOTOR) && (  
              <>
                <a
                  href="javascript:void(0)"
                  tabIndex="0"
                  interestfor="define-motor-icon"
                  aria-labelledby="define-motor-icon"
                >
                  <DisabilityMotorIcon className="icon-md" alt=""/>
                </a>
                <div id="define-motor-icon" popover="hint" aria-hidden="true">{t('fix.label.affected', {'affected': t('fix.label.disability.motor')})}</div>
              </>
            )}
            {disabilities.includes(disabilityTypes.COGNITIVE) && (  
              <>
                <a
                  href="javascript:void(0)"
                  tabIndex="0"
                  interestfor="define-cognitive-icon"
                  aria-labelledby="define-cognitive-icon"
                >
                  <DisabilityCognitiveIcon className="icon-md" alt=""/>
                </a>
                <div id="define-cognitive-icon" popover="hint" aria-hidden="true">{t('fix.label.affected', {'affected': t('fix.label.disability.cognitive')})}</div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}