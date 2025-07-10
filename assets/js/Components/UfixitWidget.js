import React, { useState, useEffect } from 'react';
import SeverityIcon from './Icons/SeverityIcon';
import FixedIcon from './Icons/FixedIcon';
import ResolvedIcon from './Icons/ResolvedIcon';
import LeftArrowIcon from './Icons/LeftArrowIcon'
import CloseIcon from './Icons/CloseIcon'
import ListIcon from './Icons/ListIcon'
import RightArrowIcon from './Icons/RightArrowIcon'
import ProgressIcon from './Icons/ProgressIcon'
import InfoIcon from './Icons/InfoIcon'
import DisabilityCognitiveIcon from './Icons/DisabilityCognitiveIcon'
import DisabilityHearingIcon from './Icons/DisabilityHearingIcon'
import DisabilityMotorIcon from './Icons/DisabilityMotorIcon'
import DisabilityVisualIcon from './Icons/DisabilityVisualIcon'
import FixIssuesResolve from './FixIssuesResolve'
import ReactHtmlParser from 'react-html-parser'
import FormClarification from './Forms/FormClarification';
import FileForm from './Forms/FileForm'
import { disabilityTypes, disabilitiesFromRule, formFromIssue, formNameFromRule } from '../Services/Ufixit'
import Api from '../Services/Api'
import * as Html from '../Services/Html'
import './UfixitWidget.css'


export default function UfixitWidget({
  t,
  settings,
  viewInfo,
  setViewInfo,
  severity,
  addMessage,
  activeIssue,
  setActiveIssue,
  activeContentItem,
  setEditedElement,
  formatIssueData,
  handleIssueResolve,
  handleIssueSave,
  handleFileResolve,
  handleFileUpload,
  isContentLoading,
  isErrorFoundInContent,
  toggleListView,
  listLength,
  nextIssue
}) {

  const [UfixitForm, setUfixitForm] = useState(null)
  const [formSummary, setFormSummary] = useState('')
  const [formLearnMore, setFormLearnMore] = useState('')
  const [showClarification, setShowClarification] = useState(false)
  const [showLearnMore, setShowLearnMore] = useState(false)
  const [disabilities, setDisabilities] = useState([])

  // The tempActiveIssue is what is sent to the form to be manipulated and can be updated
  // over and over again by the form as the HTML or other data is changed.
  const [tempActiveIssue, setTempActiveIssue] = useState(null)
  
  const formatEqualAccessMessage = () => {
    if(!activeIssue || !activeIssue.issueData || !activeIssue.issueData.metadata) {
      return ''
    }
    const metadata = JSON.parse(activeIssue.issueData.metadata)
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
    if(activeIssue) {
      setTempActiveIssue(Object.assign({}, activeIssue))
      if(activeIssue.contentType === settings.FILTER.FILE_OBJECT) {
        setUfixitForm(() => { return FileForm })
        setFormSummary(t('form.file.summary'))
        setFormLearnMore(t(`form.file.${activeIssue.fileData.fileType}.learn_more`))
        setShowClarification(false)
        setShowLearnMore(true)
        setDisabilities([disabilityTypes.COGNITIVE, disabilityTypes.VISUAL])
      }
      else {
        setUfixitForm(() => formFromIssue(activeIssue.issueData))
        setDisabilities(disabilitiesFromRule(activeIssue.scanRuleId))
        let tempFormName = formNameFromRule(activeIssue.scanRuleId)
        if(tempFormName === 'review_only') {
          setShowClarification(false)
          let ruleSummary = t(`rule.summary.${activeIssue.scanRuleId}`)
          if(ruleSummary === `rule.summary.${activeIssue.scanRuleId}`) {
            ruleSummary = formatEqualAccessMessage()
          }
          setFormSummary(ruleSummary)

          let ruleLearnMore = t(`rule.desc.${activeIssue.scanRuleId}`)
          if(ruleLearnMore === `rule.desc.${activeIssue.scanRuleId}`) {
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
      setTempActiveIssue(Object.assign({}, activeIssue, { showLongDesc: false }))
    }
    else {
      setDisabilities([])
      setUfixitForm(null)
      setTempActiveIssue(null)
    }
  }, [activeIssue])

  const setShowLongDesc = (showLongDesc) => {
    const tempIssue = Object.assign({}, tempActiveIssue)
    tempIssue.showLongDesc = showLongDesc
    setTempActiveIssue(tempIssue)
    if(showLongDesc) {
      const dialog = document.getElementById('learn-more-dialog')
      dialog.showModal()
    } else {
      const dialog = document.getElementById('learn-more-dialog')
      dialog.close()
    }
  }

  const handleActiveIssue = (newIssue) => {
    const tempIssue = Object.assign({}, tempActiveIssue)
    tempIssue.issueData = newIssue
    setTempActiveIssue(tempIssue)
    if(newIssue.newHtml && newIssue.newHtml !== '') {
      setEditedElement(newIssue.newHtml)
    }
    else {
      setEditedElement(newIssue.sourceHtml)
    }
  }

  return (
    <>
      {UfixitForm && activeIssue ? 
        (
          <div class="ufixit-widget flex-column flex-grow-1">
            {/* The header with the issue name and severity icon */}
            <div className="ufixit-widget-header flex-row justify-content-between mb-3 pb-1">
              <div className="flex-column justify-content-center allow-word-break">
                <h2 className="mt-0 mb-0 primary-text">{activeIssue.formLabel}</h2>
              </div>
              {/* <div className="flex-column justify-content-start ml-3">
                {
                  activeIssue.status === settings.FILTER.ACTIVE ? (
                    <SeverityIcon type={severity} alt="" className="icon-lg"/>
                  ) : (activeIssue.status === settings.FILTER.FIXED || activeIssue.status === settings.FILTER.FIXEDANDRESOLVED) ? (
                    <FixedIcon alt="" className="color-success icon-lg"/>
                  ) : activeIssue.status === settings.FILTER.RESOLVED ? (
                    <ResolvedIcon alt="" className="color-success icon-lg"/>
                  ) : ''
                }
              </div> */}
            </div>
            <div class="flex-row justify-content-between mb-2">
              <div className="ufixit-widget-label flex-grow-1">{t('fix.label.barrier_information')}</div>
              
            </div>
            <div className="ufixit-callout-container flex-shrink-0 mb-3" aria-hidden={!viewInfo ? "true" : "false"} >
              <div className="ufixit-instructions" 
                dangerouslySetInnerHTML={{__html: formSummary}}
              />
              { showLearnMore && (
                <div className="flex-row justify-content-end mt-2">
                  <button className="btn-link btn-small p-0" onClick={() => setShowLongDesc(true)}>
                    {/* <InfoIcon className="icon-md" /> */}
                    <div>{t('fix.button.learn_more')}</div>
                  </button>
                </div>
              )}
              { showClarification && (<FormClarification t={t} activeIssue={activeIssue} />)}
            </div>
            
            
            { activeIssue.status !== settings.FILTER.RESOLVED ? (
              <>
                <div className="ufixit-widget-label mb-2">{t('fix.label.barrier_repair')}</div>
                <div className="flex-column flex-grow-1 justify-content-between ufixit-form-content">
                  <div className="ufixit-callout-container">
                    { activeIssue.contentType === settings.FILTER.FILE_OBJECT ? (
                      <FileForm
                        t={t}
                        settings={settings}
                        activeFile={activeIssue}
                        handleFileUpload={handleFileUpload} /> )
                      : (
                      <UfixitForm
                        t={t}
                        settings={settings}
                        isDisabled={!isErrorFoundInContent}
                        activeIssue={tempActiveIssue.issueData}
                        handleIssueSave={handleIssueSave}
                        addMessage={addMessage}
                        handleActiveIssue={handleActiveIssue} /> )
                    }
                  </div>
                  </div>
                  <FixIssuesResolve
                    t={t}
                    settings={settings}
                    activeIssue={activeIssue}
                    isDisabled={!isErrorFoundInContent}
                    handleFileResolve={handleFileResolve}
                    handleIssueResolve={handleIssueResolve}
                  />
                
              </>
            ) : (
              <FixIssuesResolve
                t={t}
                settings={settings}
                activeIssue={activeIssue}
                isDisabled={!isErrorFoundInContent}
                handleFileResolve={handleFileResolve}
                handleIssueResolve={handleIssueResolve}
              />
            )}
          </div>
        ) : ''}
      <dialog id="learn-more-dialog">
        <div className="ufixit-widget-dialog flex-column">
          <div className="ufixit-widget-dialog-header flex-row justify-content-between">
            <div className="flex-column justify-content-center allow-word-break">
              <h2 className="mt-0 mb-0 primary-text">{activeIssue.formLabel}</h2>
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
  )
}