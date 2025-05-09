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
import './UfixitWidget.css'

export default function UfixitWidget({
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
      setTempActiveIssue(Object.assign({}, activeIssue))
      if(activeIssue.contentType === settings.FILTER.FILE_OBJECT) {
        setUfixitForm(() => { return FileForm })
      }
      else {
        setUfixitForm(() => formFromIssue(activeIssue.issueData))
        setFormName(formNameFromRule(activeIssue.scanRuleId))
      }
      setTempActiveIssue(Object.assign({}, activeIssue))
    }
    else {
      setFormName('')
      setUfixitForm(null)
      setTempActiveIssue(null)
    }
  }, [activeIssue])

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
            <div className="ufixit-widget-header flex-row justify-content-between mb-2">
              <div className="flex-column justify-content-center allow-word-break">
                <h2 className="mt-0 mb-0 primary-text">{activeIssue.formLabel}</h2>
              </div>
              <div className="flex-column justify-content-center ml-3">
                {
                  activeIssue.status === settings.FILTER.ACTIVE ? (
                    <SeverityIcon type={severity} alt="" className="icon-lg"/>
                  ) : activeIssue.status === settings.FILTER.FIXED ? (
                    <FixedIcon alt="" className="color-success icon-lg"/>
                  ) : activeIssue.status === settings.FILTER.RESOLVED ? (
                    <ResolvedIcon alt="" className="color-success icon-lg"/>
                  ) : ''
                }
              </div>
            </div>

            {/* The "Learn More" toggle button */}
            <div className='mb-3 flex-row justify-content-center' >
              <button
                className={`btn btn-primary btn-header ${viewInfo ? 'btn-icon-left' : 'btn-icon-right'}`}
                onClick={() => setViewInfo(!viewInfo)}
                tabindex="0" >
                { viewInfo && (
                  <div className="flex-column justify-content-center">
                    <LeftArrowIcon className="me-2 icon-sm" />
                  </div>
                )}
                <div className="flex-column justify-content-center">
                  { viewInfo ? t('fix.button.hide_learn_more') : t('fix.button.show_learn_more') }
                </div>
                { !viewInfo && (
                  <div className="flex-column justify-content-center">
                    <RightArrowIcon className="ms-2 icon-sm" />
                  </div>
                )}
              </button>
            </div>

            <div className={`ufixit-double-container flex-grow-1 flex-row gap-3 ${viewInfo ? 'ufixit-shift-view' : ''}`}>
              { /* First item: the form and controls... Visible when !viewInfo, so 'ufixit-shift-view' is NOT applied */}
              <div className="flex-grow-1 flex-column ufixit-form-container" aria-hidden={viewInfo ? "true" : "false"} >
                <div className="flex-grow-0">
                  <FormClarification t={t} activeIssue={activeIssue} />
                </div>
                {/* <h2>{activeIssue.scanRuleId}</h2> */}
                { activeIssue.status !== settings.FILTER.RESOLVED &&
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
                }
                <div className="flex-grow-0">
                  <FixIssuesResolve
                    t={t}
                    settings={settings}
                    activeIssue={activeIssue}
                    isDisabled={!isErrorFoundInContent}
                    handleFileResolve={handleFileResolve}
                    handleIssueResolve={handleIssueResolve}
                  />
                  { (activeIssue.currentState === settings.ISSUE_STATE.SAVING || activeIssue.currentState === settings.ISSUE_STATE.RESOLVING) && 
                    <div className="ufixit-overlay flex-column justify-content-center">
                      <div className="ufixit-overlay-content-container flex-row justify-content-center mb-4">
                        <div className="flex-column justify-content-center me-3">
                          <ProgressIcon className="icon-lg primary spinner" />
                        </div>
                        <div className="flex-column justify-content-center">
                          <h3>{t('form.processing')}</h3>
                        </div>
                      </div>
                    </div>
                  }
                  { !isErrorFoundInContent && (
                    <div className="ufixit-overlay flex-column justify-content-start">
                      <div className="ufixit-overlay-content-container flex-row justify-content-center mt-3">
                        <div className="flex-column justify-content-start me-3">
                          { isContentLoading ? (
                            <ProgressIcon className="icon-lg primary spinner" />
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
              </div>
              { /* Second item: the "Learn More" area... Visible when viewInfo, so 'ufixit-shift-view' IS applied */}
              <div className="flex-grow-1 ufixit-learn-container" aria-hidden={!viewInfo ? "true" : "false"} >
                { activeIssue.contentType === settings.FILTER.FILE_OBJECT
                  ? ReactHtmlParser(t(`form.file.${activeIssue.fileData.fileType}.learn_more`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })
                  : ReactHtmlParser(t(`form.${formName}.learn_more`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })
                }
              </div>
            </div>

            {/* The "Previous", "Next", and "List View" buttons (footer nav) */}
            <div className="flex-row justify-content-between mt-2">

              <button
                className={`btn text-button btn-icon-left ps-0 ${listLength < 2 ? 'disabled' : ''}`}
                onClick={() => nextIssue(true)}
                tabindex="0">
                <LeftArrowIcon className={listLength < 2 ? 'gray' : 'link-color'} />
                <div className="flex-column justify-content-center">{t('fix.button.previous')}</div>
              </button>

              <button
                className="btn text-button btn-icon-only"
                onClick={() => toggleListView()}
                tabindex="0"
                aria-label={t('fix.button.list')}
                title={t('fix.button.list')}>
                <ListIcon className="link-color" />
              </button>

              <button
                className={`btn text-button btn-icon-right pe-0 ${listLength < 2 ? 'disabled' : ''}`}
                onClick={() => nextIssue()}
                tabindex="0">
                <div className="flex-column justify-content-center">{t('fix.button.next')}</div>
                <RightArrowIcon className={listLength < 2 ? 'gray' : 'link-color'} />
              </button>

            </div>
          </>
        ) : ''}
    </>
  )
}