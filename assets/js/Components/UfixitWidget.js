import React, { useState, useEffect } from 'react';
import SeverityIcon from './Icons/SeverityIcon';
import FixedIcon from './Icons/FixedIcon';
import ResolvedIcon from './Icons/ResolvedIcon';
import LeftArrowIcon from './Icons/LeftArrowIcon'
import ListIcon from './Icons/ListIcon'
import RightArrowIcon from './Icons/RightArrowIcon'
import ProgressIcon from './Icons/ProgressIcon'
import FixIssuesResolve from './FixIssuesResolve'
import ReactHtmlParser from 'react-html-parser'
// import MessageTray from './MessageTray'
// import Preview from './Preview'
// import { ToggleDetails } from '@instructure/ui-toggle-details'
import FileForm from './Forms/FileForm'
import { returnIssueForm } from '../Services/Ufixit'
import Api from '../Services/Api'
import * as Html from '../Services/Html'
import './UfixitWidget.css'

// import Pretty from 'pretty'

export default function UfixitWidget({
  t,
  settings,
  ISSUE_STATE,
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
  toggleListView,
  listLength,
  nextIssue
}) {

  // const [windowContents, setWindowContents] = useState('preview')
  // const [expandExample, setExpandExample] = useState(false)
  // const [showExample, setShowExample] = useState(false)
  // const [pending, setPending] = useState(false)
  // const [currentIndex, setCurrentIndex] = useState(0)
  // const [code, setCode] = useState('')

  const [modalMessages, setModalMessages] = useState([])
  const [UfixitForm, setUfixitForm] = useState(null)

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
        setUfixitForm(() => returnIssueForm(activeIssue.issueData))
      }
      setTempActiveIssue(Object.assign({}, activeIssue))
    }
    else {
      setUfixitForm(null)
      setTempActiveIssue(null)
    }
  }, [activeIssue])

  // const prepareCode = (activeIssue) => {
  //   let sourceCode = (activeIssue.newHtml) ? activeIssue.newHtml : activeIssue.sourceHtml
  //   let tempCode = sourceCode

  //   if (sourceCode.length === 0 || sourceCode.length > 3000) {
  //     tempCode = '<span>Not Available</span>'
  //   } else {
  //       let element = Html.toElement(sourceCode)
        
  //       if(element && element.tagName === 'TH') {
  //         tempCode = activeIssue.previewHtml
  //       }
  //   }
  //   return Pretty(tempCode)
  // }

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
  
  // const handleExampleToggle = () => {
  //   setExpandExample(!expandExample)
  // }

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

  const handleKeyViewToggle = (event) => {
    if(event.key === 'Enter' || event.key === ' ') {
      setViewInfo(!viewInfo)
    }
  }
  // const clearMessages = () => {
  //   setModalMessages([])
  // }

  // useEffect(() => {
  //   console.info('UfixitModal loaded')
  //   console.info(JSON.stringify(activeIssue))

  //   setPending(activeIssue && (activeIssue.pending == '1'))
  //   UfixitForm = returnIssueForm(activeIssue)

  //   if (!t(`rule.example.${activeIssue.scanRuleId}`).includes('rule.example')) {
  //     setShowExample(true)
  //   }
  //   else {
  //     setShowExample(false)
  //   }

  //   setCurrentIndex(findActiveIndex())
  //   setCode(prepareCode(activeIssue))

  // }, [activeIssue, activeContentItem])

  return (
    <>
      {UfixitForm && activeIssue ? 
        (
          <>
            {/* The header with the issue name and severity icon */}
            <div className="ufixit-widget-header flex-row justify-content-between mb-2">
              <div className="flex-column justify-content-center allow-word-break">
                <h2 className="mt-0 mb-0">{activeIssue.scanRuleLabel}</h2>
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

            {/* The "Learn More" toggle */}
            <div
              className={`ufixit-widget-toggle-view-container mb-3 flex-row ${viewInfo ? 'justify-content-start' : 'justify-content-end'}`}
              onClick={() => setViewInfo(!viewInfo)}>
              { viewInfo &&
                <div
                  className="flex-row ufixit-widget-toggle-view-container-link pe-2"
                  onKeyDown={handleKeyViewToggle}
                  tabindex="0" >
                  <div className="flex-column justify-content-center">
                    <LeftArrowIcon className="primary-dark me-2" />
                  </div>
                  <div className="flex-column justify-content-center primary-dark">{t('label.hide_learn_more')}</div>
                </div> }
              { !viewInfo &&
              <div
                className="flex-row ufixit-widget-toggle-view-container-link ps-2"
                onKeyDown={handleKeyViewToggle}
                tabindex="0" >
                <div className="flex-column justify-content-center primary-dark">{t('label.show_learn_more')}</div>
                <div className="flex-column justify-content-center">
                  <RightArrowIcon className="primary-dark ms-2" />
                </div>
              </div> }
            </div>

            {/* The issue description or the form... Both should grow to fill available space. */}
            
            { viewInfo && 
              <div className="flex-grow-1 ufixit-learn-container">
                { activeIssue.contentType === settings.FILTER.FILE_OBJECT
                  ? ReactHtmlParser(t(`file.desc.${activeIssue.fileData.fileType}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })
                  : ReactHtmlParser(t(`rule.desc.${activeIssue.scanRuleId}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })
                }
              </div>
            }
            { !viewInfo &&
              <div className="flex-grow-1 flex-column ufixit-form-container">
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
                    ISSUE_STATE={ISSUE_STATE}
                    activeIssue={activeIssue}
                    handleFileResolve={handleFileResolve}
                    handleIssueResolve={handleIssueResolve}
                  />
                  { (activeIssue.currentState === ISSUE_STATE.SAVING || activeIssue.currentState === ISSUE_STATE.RESOLVING) && 
                    <div className="ufixit-overlay flex-column justify-content-center">
                      <div className="ufixit-overlay-content-container flex-row justify-content-center">
                        <div className="flex-column justify-content-center">
                          <ProgressIcon className="icon-lg primary spinner" />
                        </div>
                        <div className="flex-column justify-content-center ms-3">
                          <h2>{t('form.processing')}</h2>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            {/* The "Previous", "Next", and "List View" buttons (footer nav) */}
            <div className="flex-row justify-content-between mt-3">

              <button className={`btn text-button btn-icon-left ps-0 ${listLength < 2 ? 'disabled' : ''}`} onClick={() => nextIssue(true)}>
                <LeftArrowIcon className={listLength < 2 ? 'gray' : 'link-color'} />
                <div className="flex-column justify-content-center">Previous</div>
              </button>

              <button className="btn text-button btn-icon-only" onClick={() => toggleListView()}>
                <ListIcon className="link-color" />
              </button>

              <button className={`btn text-button btn-icon-right pe-0 ${listLength < 2 ? 'disabled' : ''}`} onClick={() => nextIssue()}>
                <div className="flex-column justify-content-center">Next</div>
                <RightArrowIcon className={listLength < 2 ? 'gray' : 'link-color'} />
              </button>

            </div>
          </>
          ) : ''}
    </>
  )
}