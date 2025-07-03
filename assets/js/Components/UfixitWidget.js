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
import FixIssuesResolve from './FixIssuesResolve'
import ReactHtmlParser from 'react-html-parser'
import FormClarification from './Forms/FormClarification';
import FileForm from './Forms/FileForm'
import { formFromIssue, formNameFromRule } from '../Services/Ufixit'
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
      }
      else {
        setUfixitForm(() => formFromIssue(activeIssue.issueData))
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
              <div className="flex-column justify-content-start ml-3">
                {
                  activeIssue.status === settings.FILTER.ACTIVE ? (
                    <SeverityIcon type={severity} alt="" className="icon-lg"/>
                  ) : (activeIssue.status === settings.FILTER.FIXED || activeIssue.status === settings.FILTER.FIXEDANDRESOLVED) ? (
                    <FixedIcon alt="" className="color-success icon-lg"/>
                  ) : activeIssue.status === settings.FILTER.RESOLVED ? (
                    <ResolvedIcon alt="" className="color-success icon-lg"/>
                  ) : ''
                }
              </div>
            </div>
            <div className="ufixit-learn-container flex-shrink-0 mb-2" aria-hidden={!viewInfo ? "true" : "false"} 
              dangerouslySetInnerHTML={{__html: formSummary}}
            />
            { showClarification && (<FormClarification t={t} activeIssue={activeIssue} />)}
            { showLearnMore && ( <div className="flex-row justify-content-end mb-3">
              <button className="btn btn-link btn-small btn-icon-left mt-2" onClick={() => setShowLongDesc(true)}>
                <InfoIcon className="icon-md" />
                <div>{t('fix.button.learn_more')}</div>
              </button>
            </div> )}
            
            { activeIssue.status !== settings.FILTER.RESOLVED ? (
              <div className="flex-column flex-grow-1 justify-content-between ufixit-form-content">
                <div>
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
                <FixIssuesResolve
                  t={t}
                  settings={settings}
                  activeIssue={activeIssue}
                  isDisabled={!isErrorFoundInContent}
                  handleFileResolve={handleFileResolve}
                  handleIssueResolve={handleIssueResolve}
                />
              </div>
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