import React from 'react';
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { IconSearchLine, IconFilterLine } from '@instructure/ui-icons'
import { Flex } from '@instructure/ui-flex'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { SimpleSelect } from '@instructure/ui-simple-select'

export default function FilesPageForm({t, searchTerm, handleSearchTerm, handleTableSettings, tableSettings, handleTrayToggle}) {

  const options = ['10', '25', '50'];

  return (
    <Flex alignItems="center" justifyItems="space-between" key="filesPageForm">
      <Flex.Item>
        <Flex alignItems="end" width="36vw" justifyItems="space-between" padding="0 0 medium 0">
          <Flex.Item>
            <TextInput
              renderLabel={<ScreenReaderContent>Search Term</ScreenReaderContent>}
              renderBeforeInput={<IconSearchLine inline={false} />}
              placeholder={t('placeholder.keyword')}
              onChange={handleSearchTerm}
              value={searchTerm}
            />
          </Flex.Item>
          <Flex.Item>
            <SimpleSelect
                renderLabel={t('label.table_rows_select')}
                assistiveText="Use arrow keys to navigate options."
                value={tableSettings.rowsPerPage}
                onChange={(e, { id, value }) => {
                  handleTableSettings({
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
          screenReaderLabel={t('open_filters_tray')}
          onClick={handleTrayToggle}
        >
          {t('label.filter')}
        </Button>
      </Flex.Item>
    </Flex>
  );
}