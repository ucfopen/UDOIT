import React from 'react';
import { TextInput } from '@instructure/ui-text-input'
import { Checkbox } from '@instructure/ui-checkbox'
import { Button } from '@instructure/ui-buttons'
import { IconSearchLine, IconFilterLine } from '@instructure/ui-icons'
import { Flex } from '@instructure/ui-flex'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'

class ContentPageForm extends React.Component {

  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Flex justifyItems="space-between" padding="0 0 medium 0" key="contentPageForm">
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
          {this.props.handleTrayToggle && 
            <Button
              renderIcon={IconFilterLine}
              screenReaderLabel={this.props.t('srlabel.open_filters_tray')}
              onClick={this.props.handleTrayToggle}>
              {this.props.t('label.filter')}
            </Button>}
        </Flex.Item>
      </Flex>
    );
  }
}

export default ContentPageForm;