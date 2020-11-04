import React from 'react';
import Classes from '../../css/ContentPreview.scss'
import { Modal } from '@instructure/ui-modal'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { CloseButton } from '@instructure/ui-buttons'
import { Text } from '@instructure/ui-text'
import { Link } from '@instructure/ui-link'
import { TruncateText } from '@instructure/ui-truncate-text'
import { InlineList } from '@instructure/ui-list'
import { IconExternalLinkLine } from '@instructure/ui-icons'

class FilesModal extends React.Component {

  constructor(props) {
    super(props);

    this.handleFileChange = this.handleFileChange.bind(this)
  }

  findActiveIndex() {
    if (this.props.filteredRows && this.props.activeFile) {
      for (const i in this.props.filteredRows) {
        let file = this.props.filteredRows[i]
        if (file.file.id === this.props.activeFile.id) {
          return Number(i)
        }
      }
    }

    return -1;
  }

  // Handler for the previous and next buttons on the modal
  // Will wrap around if the index goes out of bounds
  handleFileChange(newIndex) {
    if (newIndex < 0) {
      newIndex = this.props.filteredRows.length - 1
    }
    if (newIndex > (this.props.filteredRows.length - 1)) {
      newIndex = 0
    }
    this.props.handleActiveFile(this.props.filteredRows[newIndex].file, newIndex)
  }

  render() {
    const { activeFile } = this.props

    let activeIndex = this.findActiveIndex()

    console.log(activeIndex);
    console.log(activeFile);

    return (
      <View>
        {this.props.open &&
          <Modal
            open={this.props.open}
            size="large"
            label="A form for fixing the current file">
            <Modal.Header padding="0 medium">
              <Flex>
                <Flex.Item shouldGrow shouldShrink>
                  <Heading>{activeFile.fileName}</Heading>
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
              <Flex justifyItems="space-between" alignItems="start">
                <Flex.Item width="46%" padding="medium 0" overflowY="auto">
                  <Text as="p">{this.props.t(`file.desc.${activeFile.fileType}`)}</Text>
                </Flex.Item>
                <Flex.Item width="50%" padding="medium 0" overflowY="auto"></Flex.Item>
              </Flex>
              <View as="div" borderWidth="small 0 0 0" padding="small 0 0 0">
                <InlineList delimiter="pipe">
                  <InlineList.Item>
                    {this.props.t('label.file')} {(activeIndex + 1)} {this.props.t('label.of')} {this.props.filteredRows.length}
                  </InlineList.Item>
                  <InlineList.Item>
                    Status = {activeFile.reviewed ? 'Reviewed' : 'Unreviewed'}
                  </InlineList.Item>
                </InlineList>
              </View>
            </Modal.Body>

            <Modal.Footer>
              <Button margin="0 small" onClick={this.props.handleCloseButton}>Close</Button>
              <Button margin="0 0 0 x-small"
                onClick={() => this.handleFileChange(activeIndex - 1)}>Previous File</Button>
              <Button margin="0 0 0 x-small"
                onClick={() => this.handleFileChange(activeIndex + 1)}>Next File</Button>
            </Modal.Footer>
          </Modal>
        }
      </View>)
  }
}

export default FilesModal