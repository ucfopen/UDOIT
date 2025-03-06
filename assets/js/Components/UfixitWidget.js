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

import { returnIssueForm } from '../Services/Ufixit'
import Api from '../Services/Api'
import * as Html from '../Services/Html'
import './UfixitWidget.css'

// import Pretty from 'pretty'

export default function UfixitWidget({
  t,
  settings,
  viewInfo,
  setViewInfo,
  severity,
  activeIssue,
  setActiveIssue,
  formatIssueData,
  handleIssueResolve,
  handleIssueSave,
  toggleListView,
  listLength,
  nextIssue,
  isSaving
}) {

  // const [windowContents, setWindowContents] = useState('preview')
  // const [expandExample, setExpandExample] = useState(false)
  // const [showExample, setShowExample] = useState(false)
  // const [pending, setPending] = useState(false)
  // const [currentIndex, setCurrentIndex] = useState(0)
  const [modalMessages, setModalMessages] = useState([])
  const [UfixitForm, setUfixitForm] = useState(null)
  const [tempActiveIssue, setTempActiveIssue] = useState(null)
  // const [code, setCode] = useState('')

  useEffect(() => {
    if(activeIssue) {
      setUfixitForm(() => returnIssueForm(activeIssue.issue))
      setTempActiveIssue(Object.assign({}, activeIssue))
      console.log("Active Issue:")
      console.log(activeIssue)
    }
    else {
      setUfixitForm(null)
      setTempActiveIssue(null)
    }
  }, [activeIssue])

  // const handleOpenContent = (e) => {
  //   const contentItem = activeContentItem
  //   window.open(contentItem.url, '_blank', 'noopener,noreferrer')
  // }

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

  // const handleIssueResolve = () => {
  //   let tempIssue = Object.assign({}, activeIssue)
  //   if (tempIssue.pending) {
  //     return
  //   }

  //   if (tempIssue.status) {
  //     tempIssue.status = false
  //     tempIssue.newHtml = Html.toString(Html.removeClass(tempIssue.sourceHtml, 'phpally-ignore'))
  //   }
  //   else {
  //     tempIssue.status = 2
  //     tempIssue.newHtml = Html.toString(Html.addClass(tempIssue.sourceHtml, 'phpally-ignore'))
  //   }

  //   let api = new Api(settings)
  //   api.resolveIssue(tempIssue)
  //     .then((responseStr) => responseStr.json())
  //     .then((response) => {      
  //       // set messages 
  //       response.messages.forEach((msg) => addMessage(msg))
      
  //       if (response.data.issue) {
  //         const newIssue = { ...tempIssue, ...response.data.issue }
  //         const newReport = response.data.report

  //         // update activeIssue
  //         newIssue.pending = false
  //         newIssue.recentlyResolved = !!tempIssue.status
  //         newIssue.sourceHtml = newIssue.newHtml
  //         newIssue.newHtml = ''
  //         // Get updated report
  //         api.scanContent(newIssue.contentItemId)
  //         .then((responseStr) => responseStr.json())
  //         .then((res) => {
  //           // update activeIssue
  //           handleActiveIssue(newIssue)
            
  //           handleIssueSave(newIssue, res.data)
  //         })
  //       }
  //       else {
  //         tempIssue.pending = false
  //         handleActiveIssue(tempIssue)
  //       }
  //     })

  //   tempIssue.pending = 2
  //   handleActiveIssue(tempIssue)
  // }

  const handleSingleIssueSave = (issue) => {
    // send issue obj to PHP
    console.log("Attempting to save this issue:")
    console.log(issue)

    let api = new Api(settings)

    api.saveIssue(issue)
      .then((responseStr) => responseStr.json())
      .then((response) => {
        // specific to a failed rescan of the HTML
        if (response.data.failed) {
          response.messages.forEach((msg) => addMessage(msg))
          
          if (Array.isArray(response.data.issues)) {
            response.data.issues.forEach((issue) => {
              addMessage({
                severity: 'error',
                message: t(`form.error.${issue.ruleId}`)
              })
            })
          }

          if (Array.isArray(response.data.errors)) {
            response.data.errors.forEach((error) => {
              addMessage({
                severity: 'error',
                message: error
              })
            })
          }
        }
        else {
          // set messages 
          response.messages.forEach((msg) => addMessage(msg))

          if (response.data.issue) {
            console.log("Issue saved successfully:")
            console.log(response.data.issue)
            const newIssue = Object.assign({}, issue, response.data.issue)

            console.log("New Issue:")
            console.log(newIssue)
            // Get updated report
            api.scanContent(newIssue.contentItemId)
              .then((responseStr) => responseStr.json())
              .then((res) => {
                // update activeIssue
                setActiveIssue(formatIssueData(newIssue))
                handleIssueSave(newIssuez, res.data)
              })
          }
          else {
            setActiveIssue(formatIssueData(issue))
          }
        }
      })
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
  
  // const handleExampleToggle = () => {
  //   setExpandExample(!expandExample)
  // }

  const addMessage = (msg) => {
    setModalMessages([...modalMessages, msg])
  }

  const handleActiveIssue = (newIssue) => {
    const tempIssue = Object.assign({}, tempActiveIssue)
    tempIssue.issue = newIssue
    setTempActiveIssue(tempIssue)
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
              <div className="flex-column justify-content-center">
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
                <div className="flex-row">
                  <div className="flex-column justify-content-center">
                    <LeftArrowIcon className="primary-dark me-2" />
                  </div>
                  <div className="flex-column justify-content-center primary-dark">{t('label.hide_learn_more')}</div>
                </div> }
              { !viewInfo &&
              <div className="flex-row">
                <div className="flex-column justify-content-center primary-dark">{t('label.show_learn_more')}</div>
                <div className="flex-column justify-content-center">
                  <RightArrowIcon className="primary-dark ms-2" />
                </div>
              </div> }
            </div>

            {/* The issue description or the form... Both should grow to fill available space. */}
            
            { viewInfo && 
              <div className="flex-grow-1 ufixit-learn-container">
                {ReactHtmlParser(t(`rule.desc.${activeIssue.issue.scanRuleId}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
              </div>
            }
            { !viewInfo &&
              <div className="flex-grow-1 ufixit-form-container flex-column">
                { activeIssue.status !== settings.FILTER.RESOLVED &&
                  <div className="flex-grow-1">
                    <UfixitForm
                      t={t}
                      settings={settings}
                      activeIssue={tempActiveIssue.issue}
                      handleIssueSave={handleSingleIssueSave}
                      addMessage={addMessage} 
                      handleActiveIssue={handleActiveIssue}
                      handleManualScan={handleManualScan} />
                  </div>
                }
                <div className="flex-grow-0">
                  <FixIssuesResolve
                    t={t}
                    settings={settings}
                    isSaving={isSaving}
                    activeIssue={activeIssue}
                    handleIssueResolve={handleIssueResolve}
                  />
                </div>
                { isSaving && 
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
            }

            {/* The "Previous", "Next", and "List View" buttons (footer nav) */}
            <div className="flex-row justify-content-between mt-3">

              {listLength > 1 ? (
                <button className="btn text-button btn-icon-left ps-0" onClick={() => nextIssue(true)}>
                  <LeftArrowIcon className="link-color" />
                  <div className="flex-column justify-content-center">Previous</div>
                </button>
              ) : (
                <button className="btn text-button btn-icon-left disabled ps-0">
                  <LeftArrowIcon className="gray" />
                  <div className="flex-column justify-content-center">Previous</div>
                </button>
              )}

              <button className="btn text-button btn-icon-only" onClick={() => toggleListView()}>
                <ListIcon className="link-color" />
              </button>

              {listLength > 1 ? (
                <button className="btn text-button btn-icon-right pe-0" onClick={() => nextIssue()}>
                  <div className="flex-column justify-content-center">Next</div>
                  <RightArrowIcon className="link-color" />
                </button>
              ) : (
                <button className="btn text-button btn-icon-right disabled pe-0">
                  <div className="flex-column justify-content-center">Next</div>
                  <RightArrowIcon className="gray" />
                </button>
              )}
            </div>
          </>
          ) : ''}
    </>
  )


  // return (
  //   <View>
  //     {open &&
  //     <Modal
  //       open={open}
  //       size="large"
  //       label={t('ufixit.modal.label')}>
  //       <Modal.Header padding="0 medium">
  //         <Flex>
  //           <Flex.Item shouldGrow shouldShrink>
  //             <Heading>{t(`rule.label.${activeIssue.scanRuleId}`)}</Heading>
  //           </Flex.Item>
  //           <Flex.Item>
  //             <CloseButton
  //               placement="end"
  //               offset="small"
  //               screenReaderLabel="Close"
  //               onClick={handleCloseButton}
  //             />
  //           </Flex.Item>
  //         </Flex> 
  //       </Modal.Header>
  //       <Modal.Body padding="small medium">
  //         <MessageTray messages={modalMessages} clearMessages={clearMessages} t={t} hasNewReport={true} />
  //         <View as="div" margin="small">
  //           <View as="div" margin="small 0">
  //             <Text lineHeight="default">
  //               {ReactHtmlParser(t(`rule.desc.${activeIssue.scanRuleId}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
  //             </Text>
  //           </View>
  //           {showExample &&
  //             <ToggleDetails
  //               summary={expandExample ? (t('label.btn.hide_example')) : (t('label.btn.show_example'))}
  //               expanded={expandExample}
  //               fluidWidth={true}
  //               onToggle={handleExampleToggle}>
  //               <View as="div" margin="small 0">
  //               {ReactHtmlParser(t(`rule.example.${activeIssue.scanRuleId}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
  //               </View>
  //             </ToggleDetails>
  //           }
  //         </View>
  //         <Flex justifyItems="space-between" alignItems="start">
  //           <Flex.Item width="46%" padding="0">
  //             <View as="div">
  //               {UfixitForm && <UfixitForm
  //                 t={t}
  //                 settings={settings}
  //                 activeIssue={activeIssue}
  //                 handleIssueSave={handleSingleIssueSave}
  //                 addMessage={addMessage} 
  //                 handleActiveIssue={handleActiveIssue}
  //                 handleManualScan={handleManualScan} />
  //               }
  //             </View>
  //             {('module' !== activeContentItem.contentType) &&
  //               <View as="div" background="secondary" padding="medium" margin="small 0 0 x-small">
  //                 <Text as="div" weight="bold">{t('label.manual_resolution')}</Text>
  //                 <Text as="div" lineHeight="default">{t('label.resolved_description')}</Text>
  //                 <View as="div" padding="small 0 0 0">
  //                   {('2' == activeIssue.pending) ?
  //                     <Spinner renderTitle={t('form.processing')} size="x-small" />
  //                     :
  //                     <Checkbox onChange={handleIssueResolve} label={t('label.mark_resolved')}
  //                       checked={(activeIssue.status == '2')} disabled={(activeIssue.status == '1')} />
  //                   }
  //                 </View>
  //               </View>
  //             }
  //           </Flex.Item>
  //           <Flex.Item width="50%" padding="0" overflowY="auto">
  //             <View as="div" padding="x-small">
  //               <InlineList delimiter="pipe">
  //                 <InlineList.Item>
  //                   {('preview' === windowContents) ?
  //                     <Text weight="bold">{t('label.preview')}</Text> 
  //                     :
  //                     <Link isWithinText={false} onClick={() => handleWindowToggle('preview')}>
  //                       {t('label.preview')}</Link>
  //                   }
  //                 </InlineList.Item>
  //                 <InlineList.Item>
  //                   {('html' === windowContents) ?
  //                     <Text weight="bold">{t('label.view_source')}</Text>
  //                     :
  //                     <Link isWithinText={false} onClick={() => handleWindowToggle('html')}>
  //                       {t('label.view_source')}</Link>
  //                   }
  //                 </InlineList.Item>
  //               </InlineList>
  //               <View as="div" shadow="resting" padding="small" margin="x-small 0 0 0" height="200px" overflowY="auto">
  //                 {('preview' === windowContents) &&
  //                   <Preview
  //                     activeIssue={activeIssue}
  //                     settings={settings}
  //                   >
  //                   </Preview>
  //                 }
  //                 {('html' === windowContents) &&
  //                   <CodeEditor margin="x-small 0" label={t('label.code_preview')} language="html" readOnly={true}
  //                     value={code}
  //                     options={{ lineNumbers: true }} />
  //                 }
  //               </View>
  //             </View>
  //             <View as="div" padding="0 x-small">
  //               {/* <Text weight="bold">{t('label.source')}</Text> */}
  //               {activeContentItem &&
  //                 <View as="div">
  //                   <Pill>{activeContentItem.contentType}</Pill>
  //                   <Link onClick={handleOpenContent} isWithinText={false} margin="small" renderIcon={<IconExternalLinkLine />} iconPlacement="end">
  //                     {activeContentItem.title}
  //                   </Link>
  //                 </View>
  //               }
  //             </View>
  //           </Flex.Item>
  //         </Flex>
  //       </Modal.Body>

  //       <Modal.Footer>
  //         <View width="100%">
  //           <Flex as="div" justifyItems="space-between" shouldGrow shouldShrink>
  //             <Flex.Item>
  //               <InlineList delimiter="pipe">
  //                 <InlineList.Item>
  //                   {t('label.issue')} {(currentIndex + 1)} {t('label.of')} {filteredRows.length}
  //                 </InlineList.Item>
  //                 {activeIssue.status && !activeIssue.pending &&
  //                   <InlineList.Item>
  //                     {('1' == activeIssue.status) &&
  //                       <Pill color="success" margin="0 small">
  //                         <IconCheckMarkLine color="success" />
  //                         <View margin="0 x-small">{t('label.fixed')}</View>
  //                       </Pill>
  //                     }
  //                     {('2' == activeIssue.status) &&
  //                       <Pill color="info" margin="0 small">
  //                         <IconCheckMarkLine color="brand" />
  //                         <View margin="0 x-small">{t('label.resolved')}</View>
  //                       </Pill>
  //                     }
  //                   </InlineList.Item>
  //                 }
  //               </InlineList>
  //             </Flex.Item>
  //             <Flex.Item>
  //               <Button margin="0 small" interaction={(!pending) ? 'enabled' : 'disabled'} onClick={handleCloseButton}>{t('label.close')}</Button>
  //               <Button margin="0 0 0 x-small" interaction={(!pending) ? 'enabled' : 'disabled'} onClick={() => handleIssueChange(currentIndex - 1)}>
  //                 {t('label.previous_issue')}
  //               </Button>
  //               <Button margin="0 0 0 x-small" interaction={(!pending) ? 'enabled' : 'disabled'} onClick={() => handleIssueChange(currentIndex + 1)}>
  //                 {t('label.next_issue')}
  //               </Button>
  //             </Flex.Item>
  //           </Flex>
  //         </View>
  //       </Modal.Footer>
  //     </Modal>
  //     }
  //   </View>
  // )
}