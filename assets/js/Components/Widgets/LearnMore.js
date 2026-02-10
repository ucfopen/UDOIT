import React, { useState, useEffect } from 'react'
import LeftArrowIcon from '../Icons/LeftArrowIcon'
import DisabilityCognitiveIcon from '../Icons/DisabilityCognitiveIcon'
import DisabilityHearingIcon from '../Icons/DisabilityHearingIcon'
import DisabilityMotorIcon from '../Icons/DisabilityMotorIcon'
import DisabilityVisualIcon from '../Icons/DisabilityVisualIcon'
import { disabilityTypes, disabilitiesFromRule, formNameFromRule } from '../../Services/Ufixit'
import './UfixitWidget.css'


export default function LearnMore ({
  t,
  settings,

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

    if(tempActiveIssue.contentType === settings.ISSUE_FILTER.FILE_OBJECT) {
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
        <div className="flex-column h-100">
          <div className="ufixit-widget-dialog-content flex-column flex-grow-1">
            <div className="flex-row justify-content-start mb-2 mt-2">
              <button id="btn-learn-more-back" className="btn-text btn-icon-left btn-small ps-0" onClick={() => hideLearnMore()} tabIndex="0">
                <LeftArrowIcon className="icon-sm link-color me-2" alt=""/>
                {t('fix.button.back')}
              </button>
            </div>
            { disabilities.length > 0 && (<div className="dialog-indicator-background">
              <div className="dialog-indicator-container flex-row gap-1">
                <div className="indicator-affects">
                  {t('fix.label.affected')}
                </div>
                <div className="flex-row flex-wrap gap-1">
                  {disabilities.includes(disabilityTypes.VISUAL) && (  
                    <div className='indicator-container'>
                      <DisabilityVisualIcon className="icon-md pe-2" alt=""/>
                      <div className="flex-column align-self-center">{t('fix.label.disability.visual')}</div>
                    </div>
                  )}
                  {disabilities.includes(disabilityTypes.HEARING) && (
                    <div className='indicator-container'>
                      <DisabilityHearingIcon className="icon-md pe-2" alt=""/>
                      <div className="flex-column align-self-center">{t('fix.label.disability.hearing')}</div>
                    </div>
                  )}
                  {disabilities.includes(disabilityTypes.MOTOR) && (
                    <div className='indicator-container'>
                      <DisabilityMotorIcon className="icon-md pe-2" alt=""/>
                      <div className="flex-column align-self-center">{t('fix.label.disability.motor')}</div>
                    </div>
                  )}
                  {disabilities.includes(disabilityTypes.COGNITIVE) && (
                    <div className='indicator-container'>
                      <DisabilityCognitiveIcon className="icon-md pe-2" alt=""/>
                      <div className="flex-column align-self-center">{t('fix.label.disability.cognitive')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>)}
            <div className="flex-grow-1 flex-column ufixit-learn-container pt-3 pb-3"
              dangerouslySetInnerHTML={{__html: formLearnMore }} />
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