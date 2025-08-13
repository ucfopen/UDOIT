import React, { useState, useEffect } from 'react'
import CloseIcon from '../Icons/CloseIcon'
import DisabilityCognitiveIcon from '../Icons/DisabilityCognitiveIcon'
import DisabilityHearingIcon from '../Icons/DisabilityHearingIcon'
import DisabilityMotorIcon from '../Icons/DisabilityMotorIcon'
import DisabilityVisualIcon from '../Icons/DisabilityVisualIcon'
import FormClarification from '../Forms/FormClarification'
import FileForm from '../Forms/FileForm'
import { disabilityTypes, disabilitiesFromRule, formFromIssue, formNameFromRule } from '../../Services/Ufixit'
import './UfixitWidget.css'


export default function UfixitWidget({
  t,
  settings,

  activeContentItem,
  addMessage,
  handleFileResolve,
  handleFileUpload,
  handleIssueSave,
  isContentLoading,
  isErrorFoundInContent,
  sessionIssues,
  setTempActiveIssue,
  severity,
  tempActiveIssue,
  triggerLiveUpdate
}) {

  const [UfixitForm, setUfixitForm] = useState(null)
  const [formSummary, setFormSummary] = useState('')
  const [formLearnMore, setFormLearnMore] = useState('')
  const [showClarification, setShowClarification] = useState(false)
  const [showLearnMore, setShowLearnMore] = useState(false)
  const [disabilities, setDisabilities] = useState([])
  const [markAsReviewed, setMarkAsReviewed] = useState(false)
  
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
      setDisabilities([])
      setUfixitForm(null)
      setMarkAsReviewed(false)
      return
    }

    if(tempActiveIssue.isModified === undefined) {
      setMarkAsReviewed(tempActiveIssue.status === settings.FILTER.RESOLVED || tempActiveIssue.status === settings.FILTER.FIXEDANDRESOLVED)
    }

    if(tempActiveIssue.contentType === settings.FILTER.FILE_OBJECT) {
      setUfixitForm(() => { return FileForm })
      setFormSummary(t('form.file.summary'))
      setFormLearnMore(t(`form.file.${tempActiveIssue.fileData.fileType}.learn_more`))
      setShowClarification(false)
      setShowLearnMore(true)
      setDisabilities([disabilityTypes.COGNITIVE, disabilityTypes.VISUAL])
    }
    else {
      setUfixitForm(() => formFromIssue(tempActiveIssue.issueData))
      setDisabilities(disabilitiesFromRule(tempActiveIssue.scanRuleId))
      let tempFormName = formNameFromRule(tempActiveIssue.scanRuleId)
      if(tempFormName === 'review_only') {
        setShowClarification(false)
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
        setFormLearnMore(ruleLearnMore)
      }
      else {
        setFormSummary(t(`form.${tempFormName}.summary`))
        setFormLearnMore(t(`form.${tempFormName}.learn_more`))
        setShowClarification(true)
        setShowLearnMore(true)
      }
    }
  }, [tempActiveIssue])

  const setShowLongDesc = (showLongDesc) => {
    if(showLongDesc) {
      const dialog = document.getElementById('learn-more-dialog')
      dialog.showModal()
    } else {
      const dialog = document.getElementById('learn-more-dialog')
      dialog.close()
    }
  }

  const handleActiveIssue = (newIssue) => {
    const tempIssue = Object.create(tempActiveIssue)
    tempIssue.issueData = newIssue
    tempIssue.isModified = newIssue?.isModified || false
    setTempActiveIssue(tempIssue)
    triggerLiveUpdate()
  }

  const interceptIssueSave = (issue) => {
    handleIssueSave(issue, markAsReviewed)
  }

  return (
    <>
      {UfixitForm && tempActiveIssue ? 
        (
          <>
            <div className="ufixit-widget flex-column flex-grow-1">
              {/* The header with the issue name and severity icon */}
              <div className="ufixit-widget-header flex-row justify-content-between mb-3 pb-1">
                <div className="flex-column justify-content-center allow-word-break">
                  <h2 className="mt-0 mb-0 primary-text">{tempActiveIssue.formLabel}</h2>
                </div>
                {/* <div className="flex-column justify-content-start ml-3">
                  {
                    tempActiveIssue.status === settings.FILTER.ACTIVE ? (
                      <SeverityIcon type={severity} alt="" className="icon-lg"/>
                    ) : (tempActiveIssue.status === settings.FILTER.FIXED || tempActiveIssue.status === settings.FILTER.FIXEDANDRESOLVED) ? (
                      <FixedIcon alt="" className="color-success icon-lg"/>
                    ) : tempActiveIssue.status === settings.FILTER.RESOLVED ? (
                      <ResolvedIcon alt="" className="color-success icon-lg"/>
                    ) : ''
                  }
                </div> */}
              </div>
              <div className="flex-row justify-content-between mb-1">
                <div className="ufixit-widget-label primary flex-grow-1">{t('fix.label.barrier_information')}</div>
              </div>
              <div className="callout-container flex-shrink-0 mb-3">
                <div className="ufixit-instructions" 
                  dangerouslySetInnerHTML={{__html: formSummary}}
                />
                { showLearnMore && (
                  <div className="flex-row justify-content-end mt-2">
                    <button className="btn-link btn-small p-0" onClick={() => setShowLongDesc(true)}>
                      <div>{t('fix.button.learn_more')}</div>
                    </button>
                  </div>
                )}
                { showClarification && (
                  <FormClarification
                    t={t}
                    activeIssue={tempActiveIssue}
                  />
                )}
              </div>

              <div className="ufixit-widget-label primary mb-1">{t('fix.label.barrier_repair')}</div>
              <div className="flex-column flex-grow-1 justify-content-between ufixit-form-content">
                <div className="callout-container">
                  { tempActiveIssue.contentType === settings.FILTER.FILE_OBJECT ? (
                    <FileForm
                      t={t}
                      settings={settings}
                      
                      activeFile={tempActiveIssue.fileData}
                      handleFileResolve={handleFileResolve}
                      handleFileUpload={handleFileUpload} 
                      sessionIssues={sessionIssues} /> )
                    : (
                    <UfixitForm
                      t={t}
                      settings={settings}

                      activeIssue={tempActiveIssue.issueData}
                      activeContentItem={activeContentItem}
                      addMessage={addMessage}
                      handleActiveIssue={handleActiveIssue}
                      handleIssueSave={interceptIssueSave}
                      isContentLoading={isContentLoading}
                      isDisabled={markAsReviewed || isContentLoading || !isErrorFoundInContent}
                      markAsReviewed={markAsReviewed}
                      setMarkAsReviewed={setMarkAsReviewed} /> )
                  }
                </div>
              </div>
            </div>
            <dialog id="learn-more-dialog">
            <div className="ufixit-widget-dialog flex-column">
              <div className="ufixit-widget-dialog-header flex-row justify-content-between">
                <div className="flex-column justify-content-center allow-word-break">
                  <h2 className="mt-0 mb-0 primary-text">{tempActiveIssue.formLabel}</h2>
                </div>
                <div className="flex-column justify-content-start ml-3">
                  <button className="close-icon btn-icon-only btn-small" title={t('fix.button.close_learn_more')} alt={t('fix.button.close_learn_more')} onClick={() => setShowLongDesc(false)} tabIndex="0">
                    <CloseIcon className="icon-md primary" />
                  </button>
                </div>
              </div>
              <div className="ufixit-widget-dialog-content flex-column flex-grow-1">
                { disabilities.length > 0 && (<div className="dialog-indicator-container flex-row gap-2">
                  <div className="flex-column align-self-center flex-shrink-0">
                    {t('fix.label.affected')}
                  </div>
                  <div className="flex-row flex-wrap gap-1">
                    {disabilities.includes(disabilityTypes.VISUAL) && (  
                      <div className='indicator-container active'>
                        <DisabilityVisualIcon className="icon-md pe-2" alt=""/>
                        <div className="flex-column align-self-center">{t('fix.label.disability.visual')}</div>
                      </div>
                    )}
                    {disabilities.includes(disabilityTypes.HEARING) && (
                      <div className='indicator-container active'>
                        <DisabilityHearingIcon className="icon-md pe-2" alt=""/>
                        <div className="flex-column align-self-center">{t('fix.label.disability.hearing')}</div>
                      </div>
                    )}
                    {disabilities.includes(disabilityTypes.MOTOR) && (
                      <div className='indicator-container active'>
                        <DisabilityMotorIcon className="icon-md pe-2" alt=""/>
                        <div className="flex-column align-self-center">{t('fix.label.disability.motor')}</div>
                      </div>
                    )}
                    {disabilities.includes(disabilityTypes.COGNITIVE) && (
                      <div className='indicator-container active'>
                        <DisabilityCognitiveIcon className="icon-md pe-2" alt=""/>
                        <div className="flex-column align-self-center">{t('fix.label.disability.cognitive')}</div>
                      </div>
                    )}
                  </div>
                </div>)}
                <div className="flex-grow-1 flex-column ufixit-learn-container pt-3 pb-3"
                  dangerouslySetInnerHTML={{__html: formLearnMore }} />
                <div className="flex-row justify-content-center mb-3">
                  <button className="btn-secondary" onClick={() => setShowLongDesc(false)} tabIndex="0">
                    {t('fix.button.close_learn_more')}
                  </button>
                </div>
              </div>
            </div>
          </dialog>
        </>
      ) : ''}
    </>
  )
}