import React from 'react';
import { Modal } from '@instructure/ui-modal'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { CloseButton } from '@instructure/ui-buttons'
import { Text } from '@instructure/ui-text'
import { Link } from '@instructure/ui-link'
import { InlineList } from '@instructure/ui-list'
import { IconExternalLinkLine, IconCheckMarkLine, IconUploadSolid, IconDownloadLine } from '@instructure/ui-icons'
import { Checkbox } from '@instructure/ui-checkbox'
import { FileDrop } from '@instructure/ui-file-drop'
import MessageTray from './MessageTray';

import Api from '../Services/Api'
import { Spinner } from '@instructure/ui-spinner'

class FilesModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      replaceFileObj: null
    }
    
    this.modalMessages = []

    this.addMessage = this.addMessage.bind(this)
    this.clearMessages = this.clearMessages.bind(this)
    this.handleFileResolve = this.handleFileResolve.bind(this)
    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleOpenContent = this.handleOpenContent.bind(this)
    this.handleDownloadContent = this.handleDownloadContent.bind(this)
    this.handleDropAccept = this.handleDropAccept.bind(this)
    this.handleDropReject = this.handleDropReject.bind(this)
    this.handleFilePost = this.handleFilePost.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.activeFile.id !== this.props.activeFile.id) {
      this.setState({
        replaceFileObj: null
      })
    }
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

  handleOpenContent(e) {
    window.open(this.props.activeFile.lmsUrl, '_blank', 'noopener,noreferrer')
  }

  handleDownloadContent(e) {
    window.open(this.props.activeFile.downloadUrl, '_blank', 'download')
  }

  render() {
    const { activeFile } = this.props
    let activeIndex = this.findActiveIndex()

    return (
      <View>
        {this.props.open &&
          <Modal
            open={this.props.open}
            size="large"
            label="A form for reviewing the current file">
            <Modal.Header padding="0 medium">
              <Flex>
                <Flex.Item shouldGrow shouldShrink>
                  <Heading>{activeFile.fileName}</Heading>
                </Flex.Item>
                <Flex.Item>
                  <CloseButton
                    placement="end"
                    offset="small"
                    screenReaderLabel={this.props.t('srlabel.close')}
                    onClick={this.props.handleCloseButton}
                  />
                </Flex.Item>
              </Flex>
            </Modal.Header>
            <Modal.Body padding="small medium">
              <MessageTray messages={this.modalMessages} clearMessages={this.clearMessages} t={this.props.t} hasNewReport={true} />
              <Flex justifyItems="space-between" alignItems="start">
                <Flex.Item width="46%" padding="0" overflowY="auto">
                  <View as="div" margin="small 0" padding="small 0 medium 0" borderWidth="0 0 small 0">
                    <Link onClick={this.handleDownloadContent} margin="0 large 0 0" isWithinText={false} renderIcon={<IconDownloadLine />} iconPlacement="start">
                      {this.props.t('label.download')}
                    </Link>
                    <Link onClick={this.handleOpenContent} isWithinText={false} renderIcon={<IconExternalLinkLine />} iconPlacement="start">
                      {this.props.t('label.open_in_lms')}
                    </Link>
                  </View>
                  <View as="div" padding="small 0">
                    <Text display="block" weight="bold">{this.props.t('label.replace')}</Text>
                    <Text as="p">{this.props.t('label.replace.desc')}</Text>
                    <FileDrop
                      accept={activeFile.fileType}
                      onDropAccepted={this.handleDropAccept}
                      onDropRejected={this.handleDropReject}
                      renderLabel={
                        <View as="div" textAlign="center" padding="large">
                          <IconUploadSolid />
                          <Text as="div" size="large" lineHeight="double">
                            {this.props.t('label.file.drag_drop')}
                          </Text>
                          <Text color="brand">{this.props.t('label.file.browse_files')}</Text>
                        </View>
                      }
                      display="block"                    
                      margin="x-small"
                    />
                  </View>
                  {this.state.replaceFileObj &&
                    <View as="div" margin="x-small">
                      <View as="div">
                        <Text weight="bold">{this.props.t('label.file.new_file')}: </Text>
                        <Text padding="0 x-small">{this.state.replaceFileObj.name}</Text>
                      </View>
                      <Button color="primary" margin="small 0" onClick={this.handleFilePost}
                        interaction={(activeFile.pending) ? 'disabled' : 'enabled'}>{this.props.t('label.file.submit')}</Button>
                    </View>
                  }
                  <View as="div" background="secondary" padding="medium" margin="small 0 0 x-small">
                    <Text as="div" weight="bold">{this.props.t('label.manual_review')}</Text>
                    <Text as="div" lineHeight="default">{this.props.t('label.reviewed_description')}</Text>
                    <View as="div" padding="small 0 0 0">
                      {activeFile.pending ?
                        <Spinner renderTitle={this.props.t('form.processing')} size="x-small" />
                        :
                        <Checkbox onChange={this.handleFileResolve} label={this.props.t('label.mark_reviewed')} 
                          checked={activeFile.reviewed ? true : false} disabled={activeFile.pending} />
                      }
                    </View>
                  </View>
                </Flex.Item>
                <Flex.Item width="50%" padding="0" overflowY="auto">
                  <View as="div">
                    <Text lineHeight="default">
                      <div dangerouslySetInnerHTML={{ __html: this.props.t(`file.desc.${activeFile.fileType}`) }} />
                    </Text>
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
                        {this.props.t('label.file')} {(activeIndex + 1)} {this.props.t('label.of')} {this.props.filteredRows.length}
                      </InlineList.Item>
                      {activeFile.reviewed && !activeFile.pending &&
                        <InlineList.Item>
                          <IconCheckMarkLine color="success" />
                          <View margin="0 small">{this.props.t('label.reviewed')}</View>
                        </InlineList.Item>
                      }
                    </InlineList>
                  </Flex.Item>
                  <Flex.Item>
                    <Button margin="0 small" onClick={this.props.handleCloseButton}>{this.props.t('label.close')}</Button>
                    <Button margin="0 0 0 x-small"
                      onClick={() => this.handleFileChange(activeIndex - 1)}>{this.props.t('label.previous_file')}</Button>
                    <Button margin="0 0 0 x-small"
                    onClick={() => this.handleFileChange(activeIndex + 1)}>{this.props.t('label.next_file')}</Button>
                  </Flex.Item>
                </Flex>
              </View>
            </Modal.Footer>
          </Modal>
        }
      </View>)
  }

  handleDropAccept([file]) {
    let activeFile = Object.assign({}, this.props.activeFile)
    if (activeFile.pending) {
      return
    }

    this.setState({ replaceFileObj: file })
  }

  handleDropReject([file]) {
    this.addMessage({severity: 'warning', message: this.props.t('msg.file.replace.file_type'), timeout: 5000})
    this.forceUpdate()
  }

  handleFilePost() {
    let activeFile = Object.assign({}, this.props.activeFile)
    if (activeFile.pending) {
      return
    }

    let api = new Api(this.props.settings)
    api.postFile(activeFile, this.state.replaceFileObj)
      .then((responsStr) => responsStr.json())
      .then((response) => {
        const newFile = { ...activeFile, ...response.data.file }

        // set messages 
        response.messages.forEach((msg) => this.addMessage(msg))

        // update activeFile
        this.props.handleActiveFile(newFile)

        // update report.files
        this.props.handleFileSave(newFile)
      })

    activeFile.pending = true
    this.props.handleActiveFile(activeFile)
  }

  handleFileResolve() {
    let activeFile = Object.assign({}, this.props.activeFile)
    if (activeFile.pending) {
      return
    }

    activeFile.reviewed = !(activeFile.reviewed)

    let api = new Api(this.props.settings)
    api.reviewFile(activeFile)
      .then((responseStr) => responseStr.json())
      .then((response) => {
        const newReport = response.data.report
        const newFile = { ...activeFile, ...response.data.file }

        // set messages 
        response.messages.forEach((msg) => this.addMessage(msg))

        // update activeFile
        this.props.handleActiveFile(newFile)

        // update report.files
        this.props.handleFileSave(newFile, newReport)
      })

    activeFile.pending = true
    this.props.handleActiveFile(activeFile)
  }

  addMessage = (msg) => {
    this.modalMessages.push(msg);
  }

  clearMessages() {
    this.modalMessages = [];
  }
}

export default FilesModal;
