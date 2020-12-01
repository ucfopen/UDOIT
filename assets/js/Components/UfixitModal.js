import React from 'react';
import Classes from '../../css/ContentPreview.scss'
import { Modal } from '@instructure/ui-modal'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import { Pill } from '@instructure/ui-pill'
import { Flex } from '@instructure/ui-flex'
import { CloseButton} from '@instructure/ui-buttons'
import { Text } from '@instructure/ui-text'
import { Link } from '@instructure/ui-link'
import { TruncateText } from '@instructure/ui-truncate-text'
import { InlineList } from '@instructure/ui-list'
import { IconExternalLinkLine, IconCheckMarkLine } from '@instructure/ui-icons'
import { CodeEditor } from '@instructure/ui-code-editor'
import { Checkbox } from '@instructure/ui-checkbox'
import MessageTray from './MessageTray';

import Ufixit from '../Services/Ufixit'
import Api from '../Services/Api'
import Html from '../Services/Html'

class UfixitModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showSourceCode: false,
    }

    this.modalMessages = []
    
    this.handleCodeToggle = this.handleCodeToggle.bind(this)
    this.addMessage = this.addMessage.bind(this)
    this.clearMessages = this.clearMessages.bind(this)
    this.handleIssueSave = this.handleIssueSave.bind(this)
    this.handleIssueResolve = this.handleIssueResolve.bind(this)
    this.handleOpenContent = this.handleOpenContent.bind(this)
  }

  findActiveIndex() {
    if (this.props.filteredRows && this.props.activeIssue) {
      for (const i in this.props.filteredRows) {
        let issue = this.props.filteredRows[i]
        if (issue.issue.id === this.props.activeIssue.id) {
          return Number(i)
        }
      }
    }

    return -1;
  }

  // Handler for the previous and next buttons on the modal
  // Will wrap around if the index goes out of bounds
  handleIssueChange(newIndex) {
    if (newIndex < 0) {
      newIndex = this.props.filteredRows.length - 1
    }
    if (newIndex > (this.props.filteredRows.length - 1)) {
      newIndex = 0
    }
    this.props.handleActiveIssue(this.props.filteredRows[newIndex].issue, newIndex)
  }
  
  handleCodeToggle(e) {
    this.setState({showSourceCode: !this.state.showSourceCode})
  }

  handleOpenContent(e) {
    const contentItem = this.props.activeContentItem
    window.open(contentItem.url, '_blank', 'noopener,noreferrer')
  }

  render() {
    const ufixitService = new Ufixit()
    const { activeIssue, activeContentItem } = this.props

    let activeIndex = this.findActiveIndex();
    const UfixitForm = ufixitService.returnIssueForm(activeIssue)
    const highlightedPreview = this.highlightHtml(activeIssue)

    return (
      <View>
        {this.props.open &&
        <Modal
          open={this.props.open}
          size="large"
          label="A form for fixing the current issue">
          <Modal.Header padding="0 medium">
            <Flex>
              <Flex.Item shouldGrow shouldShrink>
                <Heading>{this.props.t(`rule.label.${activeIssue.scanRuleId}`)}</Heading>
              </Flex.Item>
              <Flex.Item>
                <CloseButton
                  placement="end"
                  offset="small"
                  screenReaderLabel="Close"
                  onClick={this.props.handleCloseButton}
                />
              </Flex.Item>
            </Flex> 
          </Modal.Header>
          <Modal.Body padding="small medium">
            <MessageTray messages={this.modalMessages} clearMessages={this.clearMessages} t={this.props.t} hasNewReport={true} />
            <View padding="0 x-small">
              <Text as="p">
                <TruncateText maxLines={2}>{this.props.t(`rule.desc.${activeIssue.scanRuleId}`)}</TruncateText>
              </Text>
            </View>
            <Flex justifyItems="space-between" alignItems="start">
              <Flex.Item width="46%" padding="0" overflowY="auto">
                <View as="div">
                  <UfixitForm activeIssue={activeIssue} t={this.props.t} 
                    handleIssueSave={this.handleIssueSave}
                    addMessage={this.addMessage} 
                    handleActiveIssue={this.props.handleActiveIssue} />
                </View>
              </Flex.Item>
              <Flex.Item width="50%" padding="0" overflowY="auto">
                <View as="div" padding="x-small">
                  <Text weight="bold">{this.props.t('label.preview')}</Text>
                  <View as="div" shadow="resting" padding="small" margin="x-small 0">
                    <div className={Classes.previewWindow}  dangerouslySetInnerHTML={{__html: highlightedPreview}} />
                  </View>
                  <Link margin="0 0 x-small 0" isWithinText={false} onClick={this.handleCodeToggle}>{this.props.t('label.view_source')}</Link>
                  {this.state.showSourceCode && 
                    <CodeEditor margin="x-small 0" label={this.props.t('label.code_preview')} language="html" readOnly={true} 
                      value={(activeIssue.newHtml) ? activeIssue.newHtml : activeIssue.sourceHtml} />
                  }
                </View>
                <View as="div" margin="medium 0 0 0" padding="0 x-small">
                  <Text weight="bold">{this.props.t('label.source')}</Text>
                  {activeContentItem && 
                    <View as="div" padding="small 0 0 0">                    
                      <Pill>{activeContentItem.contentType}</Pill> {activeContentItem.title}
                      <View as="div">
                        <Link onClick={this.handleOpenContent} isWithinText={false} margin="small 0" renderIcon={<IconExternalLinkLine />} iconPlacement="end">
                          {this.props.t('label.open_in_canvas')}
                        </Link>
                      </View>
                    </View>
                  }
                </View>
              </Flex.Item>
            </Flex>
            <View as="div" borderWidth="small 0 0 0" padding="small 0 0 0">
              <Flex justifyItems="space-between" shouldGrow shouldShrink>
                <Flex.Item>
                  {/* {this.props.t('label.issue')} {(activeIndex + 1)} {this.props.t('label.of')} {this.props.filteredRows.length} */}
                  <InlineList delimiter="pipe">
                    <InlineList.Item>
                      {this.props.t('label.issue')} {(activeIndex + 1)} {this.props.t('label.of')} {this.props.filteredRows.length}
                    </InlineList.Item>
                    {activeIssue.status && 
                      <InlineList.Item>
                        <IconCheckMarkLine color="success" />
                        <View margin="0 small">{this.props.t('label.resolved')}</View>
                      </InlineList.Item>
                    }
                  </InlineList>
                </Flex.Item>
                <Flex.Item>
                  <Checkbox onChange={this.handleIssueResolve} label={this.props.t('label.resolved')} checked={activeIssue.status ? true: false} />
                </Flex.Item>
              </Flex>
            </View>
          </Modal.Body>

          <Modal.Footer>
            <Button margin="0 small" onClick={this.props.handleCloseButton}>Close</Button>
            <Button margin="0 0 0 x-small"
              onClick={() => this.handleIssueChange(activeIndex - 1)}>Previous Issue</Button>
            <Button margin="0 0 0 x-small" 
              onClick={() => this.handleIssueChange(activeIndex + 1)}>Next Issue</Button>
          </Modal.Footer>
        </Modal>
        }
      </View>)
  }

  highlightHtml(activeIssue) {
    const html = (activeIssue.newHtml) ? activeIssue.newHtml : Html.toString(Html.toElement(activeIssue.sourceHtml))
    const highlighted = `<span class="highlighted" style="display:inline-block; border:5px dashed #F1F155;">${html}</span>`

    return activeIssue.previewHtml.replace(activeIssue.sourceHtml, highlighted)
  }

  handleIssueResolve() {
    let activeIssue = Object.assign({}, this.props.activeIssue)
    if (activeIssue.pending) {
      return
    }

    activeIssue.status = !(activeIssue.status)
    
    activeIssue.newHtml = Html.toString(Html.setAttribute(activeIssue.sourceHtml, 'data-udoit-resolved', 1))

    let api = new Api(this.props.settings)
    api.resolveIssue(activeIssue)
      .then((responseStr) => responseStr.json())
      .then((response) => {
        const newIssue = { ...activeIssue, ...response.data }

        // set messages 
        response.messages.forEach((msg) => this.addMessage(msg))

        // update activeIssue
        this.props.handleActiveIssue(newIssue)

        // update report.issues
        this.props.handleIssueSave(newIssue)
      })

    activeIssue.pending = true
    this.props.handleActiveIssue(activeIssue)
  }

  handleIssueSave(issue) {
    // send issue obj to PHP
    let api = new Api(this.props.settings)
    api.saveIssue(issue)
      .then((responseStr) => responseStr.json())
      .then((response) => {
        const newIssue = {...issue, ...response.data.issue}
        const newReport = response.data.report
        
        // set messages 
        response.messages.forEach((msg) => this.addMessage(msg))

        // update activeIssue
        this.props.handleActiveIssue(newIssue)

        // update report
        this.props.handleIssueSave(newIssue, newReport)
      })

    // update activeIssue
    issue.pending = true
    this.props.handleActiveIssue(issue)
  }
  
  addMessage = (msg) => {
    this.modalMessages.push(msg);
  }

  clearMessages() {
    this.modalMessages = [];
  }
}

export default UfixitModal;