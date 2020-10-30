import React from 'react';
import { Modal } from '@instructure/ui-modal'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { CloseButton} from '@instructure/ui-buttons'
import { Text } from '@instructure/ui-text'
import { TruncateText } from '@instructure/ui-truncate-text'
import { InlineList } from '@instructure/ui-list'
import Ufixit from '../Services/Ufixit';

class UfixitModal extends React.Component {

  constructor(props) {
    super(props);
    
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
  
  render() {
    const ufixitService = new Ufixit()
    const { activeIssue } = this.props

    let activeIndex = this.findActiveIndex();
    const UfixitForm = ufixitService.returnIssueForm(activeIssue)
    
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
                <Heading>{this.props.t('label.review_issue')}</Heading>
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
            <View padding="small 0 0 0">
              <Text weight="bold" margin="small 0">{this.props.t(`rule.label.${activeIssue.scanRuleId}`)}</Text>
              <Text as="p">
                <TruncateText maxLines={2}>{this.props.t(`rule.desc.${activeIssue.scanRuleId}`)}</TruncateText>
              </Text>
            </View>
            <Flex>
              <Flex.Item><UfixitForm activeIssue={activeIssue} /></Flex.Item>
              <Flex.Item>Preview Goes Here</Flex.Item>
            </Flex>
            <View as="div" borderWidth="small 0 0 0" padding="small 0 0 0">
              <InlineList delimiter="pipe">
                <InlineList.Item>
                  {this.props.t('label.issue')} {(activeIndex + 1)} {this.props.t('label.of')} {this.props.filteredRows.length}
                </InlineList.Item>
                <InlineList.Item>
                  Status = {activeIssue.status === false ? 'Unreviewed' : 'Reviewed'}
                </InlineList.Item>
              </InlineList>
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