import React from 'react';
import { Checkbox, CheckboxGroup } from '@instructure/ui-checkbox'
import { CloseButton } from '@instructure/ui-buttons'
import { Flex } from '@instructure/ui-flex'
import { Tray } from '@instructure/ui-tray'
import { View } from '@instructure/ui-view'
import { Heading } from '@instructure/ui-heading'

class AdminTrayForm extends React.Component {

  constructor(props) {
    super(props);

    this.handleSubaccountChange = this.handleSubaccountChange.bind(this);
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
                screenReaderLabel="Close"
                onClick={this.props.handleTrayToggle}
              />
            </Flex.Item>
          </Flex> 
          <View as="div" padding="small 0">
            <CheckboxGroup 
              name="SubAccounts"
              description={ this.props.t('label.admin.subaccounts')}
              value={this.props.filters.subAccounts}
              onChange={this.handleSubaccountChange}>
              {this.renderSubaccountCheckboxes()}
            </CheckboxGroup>
          </View>
        </View> 
      </Tray>
    );
  }

  renderSubaccountCheckboxes() {
    const subAccounts = this.props.settings.account.subAccounts;
    
    if (Array.isArray(subAccounts)) {
      return <View>{this.props.t('label.admin.no_subaccounts')}</View>
    }

    return Object.entries(subAccounts).map(([key, val]) => 
      <Checkbox label={val} value={key} key={key} />);
  }

  handleSubaccountChange(values) {
    this.props.handleFilter({subAccounts: values});
  }
}

export default AdminTrayForm;