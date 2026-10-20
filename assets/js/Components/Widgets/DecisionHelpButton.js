import React, { useState, useEffect } from 'react'
import { formNameFromRule } from '../../Services/Ufixit'
import InfoIcon from '../Icons/InfoIcon'

export default function DecisionHelpButton ({
  t,
  tempActiveIssue,
  handleLearnMoreClick,

}) {

  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    if(!tempActiveIssue) {
      setShowButton(false);
      return
    }

    let tempFormName = formNameFromRule(tempActiveIssue.scanRuleId)

    let tempDecisionQuestionKey = `form.${tempFormName}.decision`;
    let tempDecisionQuestion = t(tempDecisionQuestionKey);

    if (tempDecisionQuestionKey === tempDecisionQuestion) {
      setShowButton(false);
    }
    else {
      setShowButton(true);
    }
  }, [tempActiveIssue])

  return (
    <>
      { showButton && (
        <div className="w-100 flex-row justify-content-end mt-1">
          <button id="decide-button" className="btn-text btn-icon-left btn-small" onClick={() => handleLearnMoreClick()} >
            <InfoIcon className="icon-md link-color" alt="" aria-hidden="true" />
            <div>{t('fix.button.decide_help')}</div>
          </button>
        </div>
      )}
    </>
  )
}