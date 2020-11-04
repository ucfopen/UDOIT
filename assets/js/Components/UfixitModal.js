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
import { IconExternalLinkLine } from '@instructure/ui-icons'
import { CodeEditor } from '@instructure/ui-code-editor'
import { Checkbox } from '@instructure/ui-checkbox'
import Ufixit from '../Services/Ufixit';

class UfixitModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showSourceCode: false,
    }
    
    this.handleCodeToggle = this.handleCodeToggle.bind(this)
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
    console.log('Opening content in Canvas')
  }

  render() {
    const ufixitService = new Ufixit()
    const { activeIssue, activeContentItem } = this.props

    let activeIndex = this.findActiveIndex();
    const UfixitForm = ufixitService.returnIssueForm(activeIssue)

    console.log('content', activeContentItem)
    
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
            <View padding="0">
              <Text as="p">
                <TruncateText maxLines={2}>{this.props.t(`rule.desc.${activeIssue.scanRuleId}`)}</TruncateText>
              </Text>
            </View>
            <Flex justifyItems="space-between" alignItems="start">
              <Flex.Item width="46%" padding="medium 0" overflowY="auto">
                <UfixitForm activeIssue={activeIssue} t={this.props.t} /></Flex.Item>
              <Flex.Item width="50%" padding="medium 0" overflowY="auto">
                <View as="div">
                  <Text weight="bold">{this.props.t('label.preview')}</Text>
                  <View as="div" shadow="resting" padding="small" margin="x-small 0">
                    <div className={Classes.previewWindow}  dangerouslySetInnerHTML={{__html: activeIssue.previewHtml}} />
                  </View>
                  <Link margin="0 0 x-small 0" isWithinText={false} onClick={this.handleCodeToggle}>{this.props.t('label.view_source')}</Link>
                  {this.state.showSourceCode && 
                    <CodeEditor margin="x-small 0" label={this.props.t('label.code_preview')} language="html" readOnly={true} value={activeIssue.sourceHtml} />
                  }
                </View>
                <View as="div" margin="medium 0 0 0">
                  <Text weight="bold">{this.props.t('label.source')}</Text>
                  {activeContentItem && 
                    <View as="div" padding="small 0">                    
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
                  {this.props.t('label.issue')} {(activeIndex + 1)} {this.props.t('label.of')} {this.props.filteredRows.length}
                  {/* <InlineList delimiter="pipe">
                    <InlineList.Item>
                      {this.props.t('label.issue')} {(activeIndex + 1)} {this.props.t('label.of')} {this.props.filteredRows.length}
                    </InlineList.Item>
                    <InlineList.Item>
                      Status = {activeIssue.status ? 'Reviewed' : 'Unreviewed'}
                    </InlineList.Item>
                  </InlineList> */}
                </Flex.Item>
                <Flex.Item>
                  <Checkbox onChange={this.handleReviewToggle} label="Reviewed" checked={activeIssue.status} />
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
}

export default UfixitModal;