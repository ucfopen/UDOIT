import React from 'react'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { InlineList } from '@instructure/ui-list'
import { IconButton } from '@instructure/ui-buttons'
import { IconEditLine } from '@instructure/ui-icons'
import { FormFieldGroup } from '@instructure/ui-form-field'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { SimpleSelect } from '@instructure/ui-simple-select'
import { Button } from '@instructure/ui-buttons'

class AccountSelect extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      accountId: this.props.accountId,
      termId: this.props.termId,
    }

    this.handleAccountSelect = this.handleAccountSelect.bind(this)
    this.handleTermSelect = this.handleTermSelect.bind(this)
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
  }

  render() {
    if (this.state.editMode) {
      let accountOptions = this.getAccountOptions()
      let termOptions = this.getTermOptions()

      return (
        <View as="div" margin="large 0" padding="0 0 large 0" borderWidth="0 0 small 0">
          <FormFieldGroup 
            description={<ScreenReaderContent>{this.props.t('label.admin.select_form')}</ScreenReaderContent>}
            layout="columns"
            vAlign="top">
            <View as="p" padding="0 medium 0 0">{this.props.t('label.admin.select_form')}</View>
            <SimpleSelect
              renderLabel={this.props.t('label.admin.account')}
              value={`${this.state.accountId}`}
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
            <SimpleSelect
              renderLabel={this.props.t('label.admin.term')}
              value={`${this.state.termId}`}
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
            <Button color="primary" onClick={this.handleFormSubmit}>{this.props.t('label.admin.submit')}</Button>
          </FormFieldGroup>
        </View>
      )
    }
    else {
      let accountName = this.getAccountName()
      let termName = this.getTermName()

      return (
        <View as="div" margin="0 0 medium 0">
          <InlineList delimiter="none" itemSpacing="xx-small">
            {accountName && 
              <InlineList.Item>
                <Text size="small" weight="bold">{this.props.t('label.admin.account')} </Text> 
                {accountName}</InlineList.Item>}
            {termName && 
              <InlineList.Item>
                <Text size="small" weight="bold">{this.props.t('label.admin.term')} </Text>
                {termName}</InlineList.Item>}
            {(accountName || termName) && 
              <InlineList.Item>
                <IconButton size="small" withBorder={false} withBackground={false} onClick={this.handleEditClick} screenReaderLabel={this.props.t('label.edit')}>
                  <IconEditLine />
                </IconButton>
              </InlineList.Item>
            }
          </InlineList>
        </View>  
      )
    }
  }

  getAccountName() {
    const acct = this.props.settings.account
    
    if (!acct) {
      return false
    }

    if (!this.state.accountId || (this.state.accountId === acct.id)) {
      return acct.name
    }

    return acct.subAccounts[this.state.accountId]
  }

  getTermName() {
    const terms = this.props.settings.terms

    if (!terms) {
      return false
    }

    if (this.state.termId) {
      return terms[this.state.termId]
    }

    return false
  }

  getAccountOptions() {
    let options = []
    options.push({
      id: this.props.settings.account.id,
      name: this.props.settings.account.name})

    for (const [key, val] of Object.entries(this.props.settings.account.subAccounts)) {
      options.push({
        id: key,
        name: val
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
    this.setState({accountId: val.value})
  }

  handleTermSelect(e, val) {
    this.setState({termId: val.value})
  }

  handleEditClick(e) {
    this.setState({editMode: true})
  }

  handleFormSubmit() {
    this.setState({editMode: false})
    this.props.handleAccountSelect(this.state.accountId)
    this.props.handleTermSelect(this.state.termId)
    this.props.loadCourses(this.state.accountId, this.state.termId, true)
  }
}

export default AccountSelect