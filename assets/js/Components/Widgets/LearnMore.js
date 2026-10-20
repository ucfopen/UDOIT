import React, { useState, useEffect } from 'react'
import LeftArrowIcon from '../Icons/LeftArrowIcon'
// import DisabilityCognitiveIcon from '../Icons/DisabilityCognitiveIcon'
// import DisabilityHearingIcon from '../Icons/DisabilityHearingIcon'
// import DisabilityMotorIcon from '../Icons/DisabilityMotorIcon'
// import DisabilityVisualIcon from '../Icons/DisabilityVisualIcon'
import { disabilityTypes, disabilitiesFromRule, formNameFromRule } from '../../Services/Ufixit'
import './UfixitWidget.css'
import { ISSUE_FILTER } from '../../Services/Constants'


export default function LearnMore ({
  t,
  tempActiveIssue,
  showLearnMore,
  hideLearnMore
}) {

  const [formLearnMore, setFormLearnMore] = useState('')
  const [disabilities, setDisabilities] = useState([])
  

  useEffect(() => {
    if(!tempActiveIssue) {
      setDisabilities([])
      return
    }

    if(tempActiveIssue.contentType === ISSUE_FILTER.FILE_OBJECT) {
      setFormLearnMore(t(`form.file.${tempActiveIssue.fileData.fileType}.learn_more`))
      setDisabilities([disabilityTypes.COGNITIVE, disabilityTypes.VISUAL])
    }
    else {
      setDisabilities(disabilitiesFromRule(tempActiveIssue.scanRuleId))
      let tempFormName = formNameFromRule(tempActiveIssue.scanRuleId)
      if(tempFormName === 'review_only') {
        let ruleLearnMore = t(`rule.desc.${tempActiveIssue.scanRuleId}`)
        setFormLearnMore(ruleLearnMore)
      }
      else {
        setFormLearnMore(t(`form.${tempFormName}.learn_more`))
      }
    }
  }, [tempActiveIssue])

  return (
    <>
      { showLearnMore && (
        <div className="learn-more-container">
          <div className="ufixit-widget-dialog-content flex-column flex-grow-1 gap-2">
            <div className="flex-row justify-content-start mt-3 gap-2">
              <button
                id="btn-learn-more-back"
                className="btn-secondary btn-icon-only ps-2 pe-2"
                onClick={() => hideLearnMore()} tabIndex="0"
                aria-label={t('fix.button.back')}
                title={t('fix.button.back')}>
                <LeftArrowIcon className="icon-sm link-color" alt="" aria-hidden="false"/>
              </button>
              <div
                className="flex-grow-1 flex-column ufixit-learn-container"
                dangerouslySetInnerHTML={{__html: formLearnMore }}
              />
            </div>
            <div className="flex-row justify-content-center mb-3">
              <button id="btn-learn-more-close" className="btn-secondary" onClick={() => hideLearnMore()} tabIndex="0">
                {t('fix.button.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}