import React from 'react';
import { Checkbox, CheckboxGroup } from '@instructure/ui-checkbox'
import { CloseButton } from '@instructure/ui-buttons'
import { Flex } from '@instructure/ui-flex'
import { Tray } from '@instructure/ui-tray'
import { View } from '@instructure/ui-view'
import { Heading } from '@instructure/ui-heading'

class FilesTrayForm extends React.Component {

  constructor(props) {
    super(props);

    this.handleFileTypeChange = this.handleFileTypeChange.bind(this);
    this.handleHideReviewed = this.handleHideReviewed.bind(this);
  }

  render() {

    return (
      <Tray
        label={this.props.t('label.plural.filter')}
        open={this.props.trayOpen}
        shouldCloseOnDocumentClick={true}
        onDismiss={this.props.handleTrayToggle}
        placement="end">
        <View as="div" padding="medium">
          <Flex margin="0 0 medium 0">
            <Flex.Item shouldGrow shouldShrink>
              <Heading>{this.props.t('label.plural.filter')}</Heading>
            </Flex.Item>
            <Flex.Item>
              <CloseButton
                placement="end"
                offset="small"
                screenReaderLabel={this.props.t('srlabel.close')}
                onClick={this.props.handleTrayToggle}
              />
            </Flex.Item>
          </Flex> 
          <View as="div" padding="small 0">
            <CheckboxGroup 
              name="FileTypes"
              description={ this.props.t('label.file_type')}
              value={this.props.filters.fileTypes}
              onChange={this.handleFileTypeChange}>
              {this.renderFileTypeCheckboxes()}
            </CheckboxGroup>
          </View>
          <View as="div" padding="medium 0 0 0">
            <Checkbox 
              label={this.props.t('label.hide_reviewed')} 
              checked={this.props.filters.hideReviewed}
              onChange={this.handleHideReviewed}
            />
          </View>
          <View as="div" padding="small 0 medium 0">
            <Checkbox 
              label={this.props.t('label.hide_unpublished_files')} 
              onChange={this.handleUnpublishedFiles}
              checked={this.props.filters.hideUnpublishedFiles}
            />
          </View>
        </View> 
      </Tray>
    );
  }

  renderFileTypeCheckboxes() {
    return this.props.fileTypes.map((type) => <Checkbox label={this.props.t(`label.mime.${type}`)} value={type} key={type} />);
  }

  handleFileTypeChange(values) {
    this.props.handleFilter({fileTypes: values});
  }
  
  handleUnpublishedFiles(e) {
    this.props.handleFilter({ hideUnpublishedFiles: !this.props.filters.hideUnpublishedFiles });
  }

  handleHideReviewed(e) {
    this.props.handleFilter({ hideReviewed: !this.props.filters.hideReviewed });
  }

}

export default FilesTrayForm;