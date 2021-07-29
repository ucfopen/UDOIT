import React from 'react';
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { IconSearchLine, IconFilterLine } from '@instructure/ui-icons'
import { Flex } from '@instructure/ui-flex'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { SimpleSelect } from '@instructure/ui-simple-select'

class FilesPageForm extends React.Component {

  constructor(props) {
    super(props);

  }

  focus = () => {
    this.buttonRef.focus()
  }

  render() {
    const options = ['10', '25', '50'];
    return (
      <Flex alignItems="center" justifyItems="space-between" key="filesPageForm">
        <Flex.Item>
          <Flex alignItems="end" width="36vw" justifyItems="space-between" padding="0 0 medium 0">
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
              <SimpleSelect
                  renderLabel={this.props.t('label.table_rows_select')}
                  assistiveText="Use arrow keys to navigate options."
                  value={this.props.tableSettings.rowsPerPage}
                  onChange={(e, { id, value }) => {
                    this.props.handleTableSettings({
                      rowsPerPage: value
                    })
                    localStorage.setItem('rowsPerPage', value)
                  }}
                  width="13vw"
                  size="small"
                >
                  {options.map((opt, index) => (
                    <SimpleSelect.Option
                    key={index}
                    id={`opt-${index}`}
                    value={opt}
                    >
                    { opt }
                    </SimpleSelect.Option>
                  ))}
                </SimpleSelect>
            </Flex.Item>
          </Flex>
        </Flex.Item>
        <Flex.Item>
          <Button
            renderIcon={IconFilterLine}
            screenReaderLabel={this.props.t('open_filters_tray')}
            onClick={this.props.handleTrayToggle}
            elementRef={(node) => this.buttonRef = node}
          >
            {this.props.t('label.filter')}
          </Button>
        </Flex.Item>
      </Flex>
    );
  }
}

export default FilesPageForm;