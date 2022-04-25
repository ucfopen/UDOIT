import React from 'react';
import { Checkbox } from '@instructure/ui-checkbox'
import { SimpleSelect } from '@instructure/ui-simple-select'
import { CloseButton } from '@instructure/ui-buttons'
import { Flex } from '@instructure/ui-flex'
import { Tray } from '@instructure/ui-tray'
import { View } from '@instructure/ui-view'
import { Heading } from '@instructure/ui-heading'

class AdminTrayForm extends React.Component {

  constructor(props) {
    super(props);

    this.handleAccountSelect = this.handleAccountSelect.bind(this)
    this.handleTermSelect = this.handleTermSelect.bind(this)
    this.handleIncludeSubaccount = this.handleIncludeSubaccount.bind(this)
  }

  render() {
    let accountOptions = this.getAccountOptions()
    let termOptions = this.getTermOptions()

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
            <SimpleSelect
              renderLabel={this.props.t('label.admin.account')}
              value={`${this.props.filters.accountId}`}
              onChange={this.handleAccountSelect}
              isInline={true}
            >
              {accountOptions.map((opt, ind) => (
                <SimpleSelect.Option
                  key={`acct${ind}`}
                  id={`${opt.id}`}
                  value={`${opt.id}`}>
                  {opt.name}
                </SimpleSelect.Option>
              ))}
            </SimpleSelect>
          </View>
          <View as="div" padding="small 0">
            <SimpleSelect
              renderLabel={this.props.t('label.admin.term')}
              value={`${this.props.filters.termId}`}
              onChange={this.handleTermSelect}
              isInline={true}
            >
              {termOptions.map((opt, ind) => (
                <SimpleSelect.Option
                  key={`term${ind}`}
                  id={`${opt.id}`}
                  value={`${opt.id}`}>
                  {opt.name}
                </SimpleSelect.Option>
              ))}
            </SimpleSelect>
          </View>
          <View as="div" padding="small 0">
            <Checkbox label={this.props.t('label.admin.include_subaccounts')} value="on" 
              checked={this.props.filters.includeSubaccounts}
              onChange={this.handleIncludeSubaccount} />
          </View>
        </View> 
      </Tray>
    );
  }

  getAccountOptions() {
    let options = []

    for (const acct of Object.values(this.props.settings.accounts)) {
      options.push({
        id: acct.id,
        name: acct.name
      })
    }

    return options
  }

  getTermOptions() {
    let options = []

    for (const [key, val] of Object.entries(this.props.settings.terms)) {
      options.push({
        id: key,
        name: val,
      })
    }

    return options
  }

  handleAccountSelect(e, val) {
    this.props.handleFilter({ accountId: val.value })
  }

  handleTermSelect(e, val) {
    this.props.handleFilter({ termId: val.value })
  }

  handleIncludeSubaccount(e) {
    this.props.handleFilter({ includeSubaccounts: e.target.checked })
  }
}

export default AdminTrayForm;