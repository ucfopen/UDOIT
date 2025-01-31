import React, { useState, useEffect } from 'react';
import { Modal } from '@instructure/ui-modal'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import { Pill } from '@instructure/ui-pill'
import { Flex } from '@instructure/ui-flex'
import { CloseButton} from '@instructure/ui-buttons'
import { Text } from '@instructure/ui-text'
import { Link } from '@instructure/ui-link'
import { InlineList } from '@instructure/ui-list'
import { IconExternalLinkLine, IconCheckMarkLine } from '@instructure/ui-icons'
import { CodeEditor } from '@instructure/ui-code-editor'
import { Checkbox } from '@instructure/ui-checkbox'
import { Spinner } from '@instructure/ui-spinner'
import ReactHtmlParser from 'react-html-parser'
import MessageTray from './MessageTray'
import Preview from './Preview'
import { ToggleDetails } from '@instructure/ui-toggle-details'

import { returnIssueForm } from '../Services/Ufixit'
import Api from '../Services/Api'
import * as Html from '../Services/Html'

import Pretty from 'pretty'

export default function UfixitModal({
  t,
  settings,
  open,
  activeIssue,
  activeIndex,
  activeContentItem,
  filteredRows,
  handleCloseButton,
  handleActiveIssue,
  handleIssueSave
}) {

  const [windowContents, setWindowContents] = useState('preview')
  const [expandExample, setExpandExample] = useState(false)
  const [modalMessages, setModalMessages] = useState([])
  const [code, setCode] = useState('')
  const [UfixitForm, setUfixitForm] = useState(null)
  
  const findActiveIndex = () => {
    if (filteredRows && activeIssue) {
      for (const i in filteredRows) {
        let issue = filteredRows[i]
        if (issue.issue.id === activeIssue.id) {
          return Number(i)
        }
      }
    }

    return 0;
  }

  // Handler for the previous and next buttons on the modal
  // Will wrap around if the index goes out of bounds
  const handleIssueChange = (newIndex) => {
    if (newIndex < 0) {
      newIndex = filteredRows.length - 1
    }
    if (newIndex > (filteredRows.length - 1)) {
      newIndex = 0
    }
    clearMessages()
    handleActiveIssue(filteredRows[newIndex].issue, newIndex)
  }

  const handleWindowToggle = (val) => {
    setWindowContents(val)
  }

  const handleOpenContent = (e) => {
    const contentItem = activeContentItem
    window.open(contentItem.url, '_blank', 'noopener,noreferrer')
  }

  const prepareCode = (activeIssue) => {
    let sourceCode = (activeIssue.newHtml) ? activeIssue.newHtml : activeIssue.sourceHtml
    let tempCode = sourceCode

    if (sourceCode.length === 0 || sourceCode.length > 3000) {
      tempCode = '<span>Not Available</span>'
    } else {
        let element = Html.toElement(sourceCode)
        
        if(element && element.tagName === 'TH') {
          tempCode = activeIssue.previewHtml
        }
    }
    return Pretty(tempCode)
  }

  const handleIssueResolve = () => {
    let tempIssue = Object.assign({}, activeIssue)
    if (tempIssue.pending) {
      return
    }

    if (tempIssue.status) {
      tempIssue.status = false
      tempIssue.newHtml = Html.toString(Html.removeClass(tempIssue.sourceHtml, 'phpally-ignore'))
    }
    else {
      tempIssue.status = 2
      tempIssue.newHtml = Html.toString(Html.addClass(tempIssue.sourceHtml, 'phpally-ignore'))
    }

    let api = new Api(settings)
    api.resolveIssue(tempIssue)
      .then((responseStr) => responseStr.json())
      .then((response) => {      
        // set messages 
        response.messages.forEach((msg) => addMessage(msg))
      
        if (response.data.issue) {
          const newIssue = { ...tempIssue, ...response.data.issue }
          const newReport = response.data.report

          // update activeIssue
          newIssue.pending = false
          newIssue.recentlyResolved = !!tempIssue.status
          newIssue.sourceHtml = newIssue.newHtml
          newIssue.newHtml = ''
          // Get updated report
          api.scanContent(newIssue.contentItemId)
          .then((responseStr) => responseStr.json())
          .then((res) => {
            // update activeIssue
            handleActiveIssue(newIssue)
            
            handleIssueSave(newIssue, res.data)
          })
        }
        else {
          tempIssue.pending = false
          handleActiveIssue(tempIssue)
        }
      })

    tempIssue.pending = 2
    handleActiveIssue(tempIssue)
  }

  const handleSingleIssueSave = (issue) => {
    // send issue obj to PHP
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

          // update activeIssue
          issue.pending = false
          handleActiveIssue(issue)
        }
        else {
          // set messages 
          response.messages.forEach((msg) => addMessage(msg))

          if (response.data.issue) {
            const newIssue = {...issue, ...response.data.issue}
            newIssue.pending = false
            newIssue.recentlyUpdated = true

            // Get updated report
            api.scanContent(newIssue.contentItemId)
              .then((responseStr) => responseStr.json())
              .then((res) => {
                // update activeIssue
                handleActiveIssue(newIssue)
                handleIssueSave(newIssue, res.data)
              })
          }
          else {
            issue.pending = false
            handleActiveIssue(issue)
          }
        }
      })

    // update activeIssue
    issue.pending = 1
    handleActiveIssue(issue)
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
          const newIssue = { ...issue, ...data.data.issue }
          newIssue.pending = false
          newIssue.recentlyUpdated = true

          handleIssueSave(newIssue, data.data.report)

          // update activeIssue
          handleActiveIssue(newIssue)
        }
        else {
          issue.pending = false
          handleActiveIssue(issue)
        }
      })

    // update activeIssue
    issue.pending = 1
    handleActiveIssue(issue)
  }
  
  const handleExampleToggle = () => {
    setExpandExample(!expandExample)
  }

  const addMessage = (msg) => {
    setModalMessages([...modalMessages, msg])
  }

  const clearMessages = () => {
    setModalMessages([])
  }

  useEffect(() => {
    console.info('UfixitModal loaded')
    console.info(JSON.stringify(activeIssue))

    const pending = (activeIssue && (activeIssue.pending == '1'))
    const activeIndex = findActiveIndex()
    setUfixitForm = returnIssueForm(activeIssue)

    let showExample = false
    if (!t(`rule.example.${activeIssue.scanRuleId}`).includes('rule.example')) {
      showExample = true
    }

    setCode(prepareCode(activeIssue))

  }, [activeIssue, activeContentItem])

  return (
    <View>
      {open &&
      <Modal
        open={open}
        size="large"
        label={t('ufixit.modal.label')}>
        <Modal.Header padding="0 medium">
          <Flex>
            <Flex.Item shouldGrow shouldShrink>
              <Heading>{t(`rule.label.${activeIssue.scanRuleId}`)}</Heading>
            </Flex.Item>
            <Flex.Item>
              <CloseButton
                placement="end"
                offset="small"
                screenReaderLabel="Close"
                onClick={handleCloseButton}
              />
            </Flex.Item>
          </Flex> 
        </Modal.Header>
        <Modal.Body padding="small medium">
          <MessageTray messages={modalMessages} clearMessages={clearMessages} t={t} hasNewReport={true} />
          <View as="div" margin="small">
            <View as="div" margin="small 0">
              <Text lineHeight="default">
                {ReactHtmlParser(t(`rule.desc.${activeIssue.scanRuleId}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
              </Text>
            </View>
            {showExample &&
              <ToggleDetails
                summary={expandExample ? (t('label.btn.hide_example')) : (t('label.btn.show_example'))}
                expanded={expandExample}
                fluidWidth={true}
                onToggle={handleExampleToggle}>
                <View as="div" margin="small 0">
                {ReactHtmlParser(t(`rule.example.${activeIssue.scanRuleId}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
                </View>
              </ToggleDetails>
            }
          </View>
          <Flex justifyItems="space-between" alignItems="start">
            <Flex.Item width="46%" padding="0">
              <View as="div">
                <UfixitForm activeIssue={activeIssue} t={t} settings={settings}
                  handleIssueSave={handleSingleIssueSave}
                  addMessage={addMessage} 
                  handleActiveIssue={handleActiveIssue}
                  handleManualScan={handleManualScan} />
              </View>
              {('module' !== activeContentItem.contentType) &&
                <View as="div" background="secondary" padding="medium" margin="small 0 0 x-small">
                  <Text as="div" weight="bold">{t('label.manual_resolution')}</Text>
                  <Text as="div" lineHeight="default">{t('label.resolved_description')}</Text>
                  <View as="div" padding="small 0 0 0">
                    {('2' == activeIssue.pending) ?
                      <Spinner renderTitle={t('form.processing')} size="x-small" />
                      :
                      <Checkbox onChange={handleIssueResolve} label={t('label.mark_resolved')}
                        checked={(activeIssue.status == '2')} disabled={(activeIssue.status == '1')} />
                    }
                  </View>
                </View>
              }
            </Flex.Item>
            <Flex.Item width="50%" padding="0" overflowY="auto">
              <View as="div" padding="x-small">
                <InlineList delimiter="pipe">
                  <InlineList.Item>
                    {('preview' === windowContents) ?
                      <Text weight="bold">{t('label.preview')}</Text> 
                      :
                      <Link isWithinText={false} onClick={() => handleWindowToggle('preview')}>
                        {t('label.preview')}</Link>
                    }
                  </InlineList.Item>
                  <InlineList.Item>
                    {('html' === windowContents) ?
                      <Text weight="bold">{t('label.view_source')}</Text>
                      :
                      <Link isWithinText={false} onClick={() => handleWindowToggle('html')}>
                        {t('label.view_source')}</Link>
                    }
                  </InlineList.Item>
                </InlineList>
                <View as="div" shadow="resting" padding="small" margin="x-small 0 0 0" height="200px" overflowY="auto">
                  {('preview' === windowContents) &&
                    <Preview
                      activeIssue={activeIssue}
                      settings={settings}
                    >
                    </Preview>
                  }
                  {('html' === windowContents) &&
                    <CodeEditor margin="x-small 0" label={t('label.code_preview')} language="html" readOnly={true}
                      value={code}
                      options={{ lineNumbers: true }} />
                  }
                </View>
              </View>
              <View as="div" padding="0 x-small">
                {/* <Text weight="bold">{t('label.source')}</Text> */}
                {activeContentItem &&
                  <View as="div">
                    <Pill>{activeContentItem.contentType}</Pill>
                    <Link onClick={handleOpenContent} isWithinText={false} margin="small" renderIcon={<IconExternalLinkLine />} iconPlacement="end">
                      {activeContentItem.title}
                    </Link>
                  </View>
                }
              </View>
            </Flex.Item>
          </Flex>
        </Modal.Body>

        <Modal.Footer>
          <View width="100%">
            <Flex as="div" justifyItems="space-between" shouldGrow shouldShrink>
              <Flex.Item>
                <InlineList delimiter="pipe">
                  <InlineList.Item>
                    {t('label.issue')} {(activeIndex + 1)} {t('label.of')} {filteredRows.length}
                  </InlineList.Item>
                  {activeIssue.status && !activeIssue.pending &&
                    <InlineList.Item>
                      {('1' == activeIssue.status) &&
                        <Pill color="success" margin="0 small">
                          <IconCheckMarkLine color="success" />
                          <View margin="0 x-small">{t('label.fixed')}</View>
                        </Pill>
                      }
                      {('2' == activeIssue.status) &&
                        <Pill color="info" margin="0 small">
                          <IconCheckMarkLine color="brand" />
                          <View margin="0 x-small">{t('label.resolved')}</View>
                        </Pill>
                      }
                    </InlineList.Item>
                  }
                </InlineList>
              </Flex.Item>
              <Flex.Item>
                <Button margin="0 small" interaction={(!pending) ? 'enabled' : 'disabled'} onClick={handleCloseButton}>{t('label.close')}</Button>
                <Button margin="0 0 0 x-small" interaction={(!pending) ? 'enabled' : 'disabled'} onClick={() => handleIssueChange(activeIndex - 1)}>
                  {t('label.previous_issue')}
                </Button>
                <Button margin="0 0 0 x-small" interaction={(!pending) ? 'enabled' : 'disabled'} onClick={() => handleIssueChange(activeIndex + 1)}>
                  {t('label.next_issue')}
                </Button>
              </Flex.Item>
            </Flex>
          </View>
        </Modal.Footer>
      </Modal>
      }
    </View>
  )
}





// class UfixitModal extends React.Component {

//   constructor(props) {
//     super(props);

//     this.state = {
//       windowContents: 'preview',
//       expandExample: false,
//     }

//     this.modalMessages = []
    
//     this.handleWindowToggle = this.handleWindowToggle.bind(this)
//     this.addMessage = this.addMessage.bind(this)
//     this.clearMessages = this.clearMessages.bind(this)
//     this.handleIssueSave = this.handleIssueSave.bind(this)
//     this.handleIssueResolve = this.handleIssueResolve.bind(this)
//     this.handleOpenContent = this.handleOpenContent.bind(this)
//     this.handleExampleToggle = this.handleExampleToggle.bind(this)
//     this.handleManualScan = this.handleManualScan.bind(this)
//   }

//   findActiveIndex() {
//     if (this.props.filteredRows && this.props.activeIssue) {
//       for (const i in this.props.filteredRows) {
//         let issue = this.props.filteredRows[i]
//         if (issue.issue.id === this.props.activeIssue.id) {
//           return Number(i)
//         }
//       }
//     }

//     return 0;
//   }

//   // Handler for the previous and next buttons on the modal
//   // Will wrap around if the index goes out of bounds
//   handleIssueChange(newIndex) {
//     if (newIndex < 0) {
//       newIndex = this.props.filteredRows.length - 1
//     }
//     if (newIndex > (this.props.filteredRows.length - 1)) {
//       newIndex = 0
//     }
//     this.clearMessages()
//     this.props.handleActiveIssue(this.props.filteredRows[newIndex].issue, newIndex)
//   }
  
//   handleWindowToggle(val) {
//     this.setState({windowContents: val})
//   }

//   handleOpenContent(e) {
//     const contentItem = this.props.activeContentItem
//     window.open(contentItem.url, '_blank', 'noopener,noreferrer')
//   }

//   render() {
//     const { activeIssue, activeContentItem } = this.props

//     const pending = (this.props.activeIssue && (this.props.activeIssue.pending == '1'))

//     let activeIndex = this.findActiveIndex();
//     const UfixitForm = returnIssueForm(activeIssue)

//     let showExample = false
//     if (!this.props.t(`rule.example.${activeIssue.scanRuleId}`).includes('rule.example')) {
//       showExample = true
//     }

//     let code = this.prepareCode(activeIssue)

//     return (
//       <View>
//         {this.props.open &&
//         <Modal
//           open={this.props.open}
//           size="large"
//           label={this.props.t('ufixit.modal.label')}>
//           <Modal.Header padding="0 medium">
//             <Flex>
//               <Flex.Item shouldGrow shouldShrink>
//                 <Heading>{this.props.t(`rule.label.${activeIssue.scanRuleId}`)}</Heading>
//               </Flex.Item>
//               <Flex.Item>
//                 <CloseButton
//                   placement="end"
//                   offset="small"
//                   screenReaderLabel="Close"
//                   onClick={this.props.handleCloseButton}
//                 />
//               </Flex.Item>
//             </Flex> 
//           </Modal.Header>
//           <Modal.Body padding="small medium">
//             <MessageTray messages={this.modalMessages} clearMessages={this.clearMessages} t={this.props.t} hasNewReport={true} />
//             <View as="div" margin="small">
//               <View as="div" margin="small 0">
//                 <Text lineHeight="default">
//                   {ReactHtmlParser(this.props.t(`rule.desc.${activeIssue.scanRuleId}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}
//                 </Text>
//               </View>
//               {showExample &&
//                 <ToggleDetails
//                   summary={this.state.expandExample ? (this.props.t('label.btn.hide_example')) : (this.props.t('label.btn.show_example'))}
//                   expanded={this.state.expandExample}
//                   fluidWidth={true}
//                   onToggle={this.handleExampleToggle}>
//                   <View as="div" margin="small 0">
//                   {ReactHtmlParser(this.props.t(`rule.example.${activeIssue.scanRuleId}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}
//                   </View>
//                 </ToggleDetails>
//               }
//             </View>
//             <Flex justifyItems="space-between" alignItems="start">
//               <Flex.Item width="46%" padding="0">
//                 <View as="div">
//                   <UfixitForm activeIssue={activeIssue} t={this.props.t} settings={this.props.settings}
//                     handleIssueSave={this.handleIssueSave}
//                     addMessage={this.addMessage} 
//                     handleActiveIssue={this.props.handleActiveIssue}
//                     handleManualScan={this.handleManualScan} />
//                 </View>
//                 {('module' !== activeContentItem.contentType) &&
//                   <View as="div" background="secondary" padding="medium" margin="small 0 0 x-small">
//                     <Text as="div" weight="bold">{this.props.t('label.manual_resolution')}</Text>
//                     <Text as="div" lineHeight="default">{this.props.t('label.resolved_description')}</Text>
//                     <View as="div" padding="small 0 0 0">
//                       {('2' == activeIssue.pending) ? 
//                         <Spinner renderTitle={this.props.t('form.processing')} size="x-small" />
//                         :
//                         <Checkbox onChange={this.handleIssueResolve} label={this.props.t('label.mark_resolved')}
//                           checked={(activeIssue.status == '2')} disabled={(activeIssue.status == '1')} />
//                       }
//                     </View>
//                   </View>
//                 }
//               </Flex.Item>
//               <Flex.Item width="50%" padding="0" overflowY="auto">
//                 <View as="div" padding="x-small">
//                   <InlineList delimiter="pipe">
//                     <InlineList.Item>
//                       {('preview' === this.state.windowContents) ?
//                         <Text weight="bold">{this.props.t('label.preview')}</Text> 
//                         :
//                         <Link isWithinText={false} onClick={() => this.handleWindowToggle('preview')}>
//                           {this.props.t('label.preview')}</Link>
//                       }
//                     </InlineList.Item>
//                     <InlineList.Item>
//                       {('html' === this.state.windowContents) ?
//                         <Text weight="bold">{this.props.t('label.view_source')}</Text>
//                         :
//                         <Link isWithinText={false} onClick={() => this.handleWindowToggle('html')}>
//                           {this.props.t('label.view_source')}</Link>
//                       }
//                     </InlineList.Item>
//                   </InlineList>
//                   <View as="div" shadow="resting" padding="small" margin="x-small 0 0 0" height="200px" overflowY="auto">
//                     {('preview' === this.state.windowContents) &&       
//                       <Preview
//                         activeIssue={this.props.activeIssue}
//                         settings={this.props.settings}
//                       >  
//                       </Preview>           
//                     }
//                     {('html' === this.state.windowContents) &&
//                       <CodeEditor margin="x-small 0" label={this.props.t('label.code_preview')} language="html" readOnly={true}
//                         value={code}
//                         options={{ lineNumbers: true }} />
//                     }
//                   </View>
//                 </View>
//                 <View as="div" padding="0 x-small">
//                   {/* <Text weight="bold">{this.props.t('label.source')}</Text> */}
//                   {activeContentItem && 
//                     <View as="div">                    
//                       <Pill>{activeContentItem.contentType}</Pill>
//                       <Link onClick={this.handleOpenContent} isWithinText={false} margin="small" renderIcon={<IconExternalLinkLine />} iconPlacement="end">
//                           {activeContentItem.title}
//                         </Link>
//                     </View>
//                   }
//                 </View>
//               </Flex.Item>
//             </Flex>
//           </Modal.Body>

//           <Modal.Footer>
//             <View width="100%">
//               <Flex as="div" justifyItems="space-between" shouldGrow shouldShrink>
//                 <Flex.Item>
//                   <InlineList delimiter="pipe">
//                     <InlineList.Item>
//                       {this.props.t('label.issue')} {(activeIndex + 1)} {this.props.t('label.of')} {this.props.filteredRows.length}
//                     </InlineList.Item>
//                     {activeIssue.status && !activeIssue.pending &&
//                       <InlineList.Item>
//                         {('1' == activeIssue.status) &&
//                           <Pill color="success" margin="0 small">
//                             <IconCheckMarkLine color="success" />
//                             <View margin="0 x-small">{this.props.t('label.fixed')}</View>
//                           </Pill>
//                         }
//                         {('2' == activeIssue.status) &&
//                           <Pill color="info" margin="0 small">
//                             <IconCheckMarkLine color="brand" />
//                             <View margin="0 x-small">{this.props.t('label.resolved')}</View>
//                           </Pill>
//                         }
//                       </InlineList.Item>
//                     }
//                   </InlineList>
//                 </Flex.Item>
//                 <Flex.Item>
//                   <Button margin="0 small" interaction={(!pending) ? 'enabled' : 'disabled'} onClick={this.props.handleCloseButton}>{this.props.t('label.close')}</Button>
//                   <Button margin="0 0 0 x-small" interaction={(!pending) ? 'enabled' : 'disabled'} onClick={() => this.handleIssueChange(activeIndex - 1)}>
//                     {this.props.t('label.previous_issue')}
//                   </Button>
//                   <Button margin="0 0 0 x-small" interaction={(!pending) ? 'enabled' : 'disabled'} onClick={() => this.handleIssueChange(activeIndex + 1)}>
//                     {this.props.t('label.next_issue')}
//                   </Button>
//                 </Flex.Item>
//               </Flex>            
//             </View>
//           </Modal.Footer>
//         </Modal>
//         }
//       </View>)
//   }

//   prepareCode(activeIssue) {
//     let sourceCode = (activeIssue.newHtml) ? activeIssue.newHtml : activeIssue.sourceHtml
//     let code = sourceCode

//     if (sourceCode.length === 0 || sourceCode.length > 3000) {
//       code = '<span>Not Available</span>'
//     } else {
//         let element = Html.toElement(sourceCode)
        
//         if(element && element.tagName === 'TH') {
//           code = activeIssue.previewHtml
//         }
//     }
//     return Pretty(code)
//   }


//   handleIssueResolve() {
//     let activeIssue = Object.assign({}, this.props.activeIssue)
//     if (activeIssue.pending) {
//       return
//     }

//     if (activeIssue.status) {
//       activeIssue.status = false
//       activeIssue.newHtml = Html.toString(Html.removeClass(activeIssue.sourceHtml, 'phpally-ignore'))
//     }
//     else {
//       activeIssue.status = 2
//       activeIssue.newHtml = Html.toString(Html.addClass(activeIssue.sourceHtml, 'phpally-ignore'))
//     }
    
//     let api = new Api(this.props.settings)
//     api.resolveIssue(activeIssue)
//       .then((responseStr) => responseStr.json())
//       .then((response) => {      
//         // set messages 
//         response.messages.forEach((msg) => this.addMessage(msg))
      
//         if (response.data.issue) {
//           const newIssue = { ...activeIssue, ...response.data.issue }
//           const newReport = response.data.report

//           // update activeIssue
//           newIssue.pending = false
//           newIssue.recentlyResolved = !!activeIssue.status
//           newIssue.sourceHtml = newIssue.newHtml
//           newIssue.newHtml = ''
//           // Get updated report
//           api.scanContent(newIssue.contentItemId)
//           .then((responseStr) => responseStr.json())
//           .then((res) => {
//             // update activeIssue
//             this.props.handleActiveIssue(newIssue)
            
//             this.props.handleIssueSave(newIssue, res.data)
//           })
//         }
//         else {
//           activeIssue.pending = false
//           this.props.handleActiveIssue(activeIssue)
//         }
//       })

//     activeIssue.pending = 2
//     this.props.handleActiveIssue(activeIssue)
//   }

//   handleIssueSave(issue) {
//     // send issue obj to PHP
//     let api = new Api(this.props.settings)

//     api.saveIssue(issue)
//       .then((responseStr) => responseStr.json())
//       .then((response) => {
//         // specific to a failed rescan of the HTML
//         if (response.data.failed) {
//           response.messages.forEach((msg) => this.addMessage(msg))
          
//           if (Array.isArray(response.data.issues)) {
//             response.data.issues.forEach((issue) => {
//               this.addMessage({
//                 severity: 'error',
//                 message: this.props.t(`form.error.${issue.ruleId}`)
//               })
//             })
//           }

//           if (Array.isArray(response.data.errors)) {
//             response.data.errors.forEach((error) => {
//               this.addMessage({
//                 severity: 'error',
//                 message: error
//               })
//             })
//           }

//           // update activeIssue
//           issue.pending = false
//           this.props.handleActiveIssue(issue)
//         }
//         else {
//           // set messages 
//           response.messages.forEach((msg) => this.addMessage(msg))

//           if (response.data.issue) {
//             const newIssue = {...issue, ...response.data.issue}
//             newIssue.pending = false
//             newIssue.recentlyUpdated = true

//             // Get updated report
//             api.scanContent(newIssue.contentItemId)
//               .then((responseStr) => responseStr.json())
//               .then((res) => {
//                 // update activeIssue
//                 this.props.handleActiveIssue(newIssue)
                
//                 this.props.handleIssueSave(newIssue, res.data)
//               })
//           }
//           else {
//             issue.pending = false
//             this.props.handleActiveIssue(issue)
//           }
//         }
//       })

//     // update activeIssue
//     issue.pending = 1
//     this.props.handleActiveIssue(issue)
//   }


//   handleManualScan(issue) {
//     let api = new Api(this.props.settings)
//     api.scanIssue(issue.id)
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.messages) {
//           data.messages.forEach((msg) => {
//             if (msg.visible) {
//               this.addMessage(msg);
//             }
//           });
//         }
//         if (data.data.issue) {
//           const newIssue = { ...issue, ...data.data.issue }
//           newIssue.pending = false
//           newIssue.recentlyUpdated = true

//           this.props.handleIssueSave(newIssue, data.data.report)

//           // update activeIssue
//           this.props.handleActiveIssue(newIssue)
//         }
//         else {
//           issue.pending = false
//           this.props.handleActiveIssue(issue)
//         }
//       })

//     // update activeIssue
//     issue.pending = 1
//     this.props.handleActiveIssue(issue)
//   }

//   handleExampleToggle() {
//     this.setState({expandExample: !this.state.expandExample})
//   }
  
//   addMessage = (msg) => {
//     this.modalMessages.push(msg);
//   }

//   clearMessages() {
//     this.modalMessages = [];
//   }
// }

// export default UfixitModal;
