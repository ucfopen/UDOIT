import React from 'react';
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { IconSearchLine, IconFilterLine } from '@instructure/ui-icons'
import { Flex } from '@instructure/ui-flex'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'

class FilesPageForm extends React.Component {

  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Flex justifyItems="space-between" padding="0 0 medium 0" key="filesPageForm">
        <Flex.Item>
          <TextInput
            renderLabel={<ScreenReaderContent>Search Term</ScreenReaderContent>}
            renderBeforeInput={<IconSearchLine inline={false} />}
            placeholder={this.props.t('placeholder.keyword')}
            onChange={this.props.handleSearchTerm}
            value={this.props.searchTerm}
          />
        </Flex.Item>
        <Flex.Item>
          <Button
            renderIcon={IconFilterLine}
            screenReaderLabel={this.props.t('open_filters_tray')}
            onClick={this.props.handleTrayToggle}>
            {this.props.t('label.filter')}
          </Button>
        </Flex.Item>
      </Flex>
    );
  }
}

export default FilesPageForm;