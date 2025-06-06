import React, { useState, useEffect } from 'react';
import SeverityIcon from './Icons/SeverityIcon';
import FixedIcon from './Icons/FixedIcon';
import ResolvedIcon from './Icons/ResolvedIcon';
import LeftArrowIcon from './Icons/LeftArrowIcon'
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
import './UfixitWidgetSimple.css'
import './FixIssuesResolve.css'
import UFIXITIcon from './Icons/UFIXITIcon';

export default function UfixitWidgetSimple({
  t,
  settings,
  viewInfo,
  setViewInfo,
  severity,
  activeIssue,
  setActiveIssue,
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

  const [modalMessages, setModalMessages] = useState([])
  const [UfixitForm, setUfixitForm] = useState(null)
  const [formName, setFormName] = useState('')

  // The tempActiveIssue is what is sent to the form to be manipulated and can be updated
  // over and over again by the form as the HTML or other data is changed.
  const [tempActiveIssue, setTempActiveIssue] = useState(null)

  useEffect(() => {
    if(activeIssue) {
      if(activeIssue.contentType === settings.FILTER.FILE_OBJECT) {
        setUfixitForm(() => { return FileForm })
      }
      else {
        setUfixitForm(() => formFromIssue(activeIssue.issueData))
        setFormName(formNameFromRule(activeIssue.scanRuleId))
      }
      setTempActiveIssue(Object.assign({}, activeIssue, { needsFixing: false }))
    }
    else {
      setFormName('')
      setUfixitForm(null)
      setTempActiveIssue(null)
    }
  }, [activeIssue])

  const setNeedsFixing = (needsFixing) => {
    const tempIssue = Object.assign({}, tempActiveIssue)
    tempIssue.needsFixing = needsFixing
    setTempActiveIssue(tempIssue)
  }

  const handleResolve = () => {
    if(activeIssue.contentType === settings.FILTER.FILE_OBJECT) {
      handleFileResolve(activeIssue.fileData)
    } else {
      handleIssueResolve(activeIssue.issueData)
    }
  }

  const handleManualScan = (issue) => {
    let api = new Api(settings)
    api.scanIssue(issue.id)
      .then((response) => response.json())
      .then((data) => {
        if (data.messages) {
          data.messages.forEach((msg) => {
            if (msg.visible) {
              addMessage(msg);
            }
          });
        }
        if (data.data.issue) {
          const newIssue = Object.assign({}, issue, data.data.issue)
          handleIssueSave(newIssue, data.data.report)

          // update activeIssue
          setActiveIssue(formatIssueData(newIssue))
        }
        else {
          issue.pending = false
          setActiveIssue(formatIssueData(issue))
        }
      })
  }

  const addMessage = (msg) => {
    setModalMessages([...modalMessages, msg])
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
          <>
            {/* The header with the issue name and severity icon */}
            <div className="ufixit-widget-header flex-row justify-content-between mb-3">
              <div className="flex-column justify-content-center allow-word-break">
                <h2 className="mt-0 mb-0 primary-text">{activeIssue.formLabel}</h2>
              </div>
              <div className="flex-column justify-content-center ml-3">
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

            { !tempActiveIssue.needsFixing && (
              <>
                <div className="flex-grow-1 ufixit-learn-container" aria-hidden={!viewInfo ? "true" : "false"} >
                  <FormClarification t={t} activeIssue={activeIssue} />
                  { activeIssue.contentType === settings.FILTER.FILE_OBJECT
                    ? ReactHtmlParser(t(`form.file.${activeIssue.fileData.fileType}.learn_more`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })
                    : formName !== 'review_only' || t(`rule.desc.${activeIssue.scanRuleId}`) === `rule.desc.${activeIssue.scanRuleId}`
                      ? ReactHtmlParser(t(`form.${formName}.learn_more`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })
                      : ReactHtmlParser(t(`rule.desc.${activeIssue.scanRuleId}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })
                  }
                </div>

                <div className="ufixit-widget-resolve-container mt-3">
                  <div className="ufixit-widget-resolve-description">
                    Based on this explanation, is the highlighted content an accessibility barrier?
                  </div>
                  <div className="flex-column w-100 mt-3">
                    <div className="flex-row align-self-center">
                      <button className="btn btn-primary btn-icon-left" onClick={() => setNeedsFixing(true)}>
                        <UFIXITIcon className="icon-md" />
                        <div>YES. Let's Fix It!</div>
                      </button>
                    </div>
                    <div className="flex-row align-self-center">
                      <button className="btn btn-secondary btn-icon-left mt-2" onClick={() => handleResolve()}>
                        <ResolvedIcon className="icon-md" />
                        <div>NO. It's Not a Barrier</div>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            { tempActiveIssue.needsFixing && (

              <div className="flex-grow-1 flex-column ufixit-form-container">
                <div className="flex-grow-0">
                  <FormClarification t={t} activeIssue={activeIssue} />
                </div>
                { activeIssue.status !== settings.FILTER.RESOLVED ? (
                  <div className="flex-grow-1 ufixit-form-content">
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
                        handleActiveIssue={handleActiveIssue}
                        handleManualScan={handleManualScan} /> )
                    }
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
                <div className="flex-grow-0">
                  <button className="btn btn-secondary btn-icon-left mt-3" onClick={() => setNeedsFixing(false)}>
                    <LeftArrowIcon className="icon-md" />
                    <div>Back to Explanation</div>
                  </button>
                </div>
                { (activeIssue.currentState === settings.ISSUE_STATE.SAVING || activeIssue.currentState === settings.ISSUE_STATE.RESOLVING) && 
                  <div className="ufixit-overlay flex-column justify-content-start">
                    <div className="ufixit-overlay-content-container flex-row justify-content-center mt-3">
                      <div className="flex-column justify-content-center me-3">
                        <ProgressIcon className="icon-lg udoit-suggestion spinner" />
                      </div>
                      <div className="flex-column justify-content-center">
                        <h3 className="mb-0 mt-0">{t('form.processing')}</h3>
                      </div>
                    </div>
                  </div>
                }
                { !isErrorFoundInContent && (
                  <div className="ufixit-overlay flex-column justify-content-start">
                    <div className="ufixit-overlay-content-container flex-row justify-content-center mt-3">
                      <div className="flex-column justify-content-start me-3">
                        { isContentLoading ? (
                          <ProgressIcon className="icon-lg udoit-suggestion spinner" />
                        ) : (
                          <InfoIcon className="icon-lg udoit-suggestion" />
                        )}
                      </div>
                      <div className="flex-column justify-content-center">
                        <h3 className="mb-0 mt-0">
                          {isContentLoading ? t('fix.label.loading_content') : t('fix.label.no_saving')}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : ''}
    </>
  )
}