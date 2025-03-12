import React from 'react';
import { Checkbox, CheckboxGroup } from '@instructure/ui-checkbox'
import { CloseButton } from '@instructure/ui-buttons'
import { Flex } from '@instructure/ui-flex'
import { Tray } from '@instructure/ui-tray'
import { View } from '@instructure/ui-view'
import { Heading } from '@instructure/ui-heading'

export default function FilesTrayForm({t, trayOpen, handleTrayToggle, filters, handleFilter, fileTypes}) {

  const renderFileTypeCheckboxes = () => {
    return fileTypes.map((type) => <Checkbox label={t(`label.mime.${type}`)} value={type} key={type} />);
  }

  const handleFileTypeChange = (values) => {  
    handleFilter({fileTypes: values})
  }

  const handleUnpublishedFiles = (e) => {
    handleFilter({ hideUnpublishedFiles: !filters.hideUnpublishedFiles })
  }

  const handleHideReviewed = (e) => {
    handleFilter({ hideReviewed: !filters.hideReviewed })
  }

  return (
    <Tray
      label={t('label.plural.filter')}
      open={trayOpen}
      shouldCloseOnDocumentClick={true}
      onDismiss={handleTrayToggle}
      placement="end">
      <View as="div" padding="medium">
        <Flex margin="0 0 medium 0">
          <Flex.Item shouldGrow shouldShrink>
            <Heading>{t('label.plural.filter')}</Heading>
          </Flex.Item>
          <Flex.Item>
            <CloseButton
              placement="end"
              offset="small"
              screenReaderLabel={t('srlabel.close')}
              onClick={handleTrayToggle}
            />
          </Flex.Item>
        </Flex> 
        <View as="div" padding="small 0">
          <CheckboxGroup 
            name="FileTypes"
            description={ t('label.file_type')}
            value={filters.fileTypes}
            onChange={handleFileTypeChange}>
            {renderFileTypeCheckboxes()}
          </CheckboxGroup>
        </View>
        <View as="div" padding="medium 0 0 0">
          <Checkbox 
            label={t('label.hide_reviewed')} 
            checked={filters.hideReviewed}
            onChange={handleHideReviewed}
          />
        </View>
        <View as="div" padding="small 0 medium 0">
          <Checkbox 
            label={t('label.hide_unpublished_files')} 
            onChange={handleUnpublishedFiles}
            checked={filters.hideUnpublishedFiles}
          />
        </View>
      </View> 
    </Tray>
  );
}