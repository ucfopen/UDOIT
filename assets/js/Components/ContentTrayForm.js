import React from 'react';
import { Checkbox, CheckboxGroup } from '@instructure/ui-checkbox'
import { CloseButton } from '@instructure/ui-buttons'
import { Flex } from '@instructure/ui-flex'
import { Tray } from '@instructure/ui-tray'
import { View } from '@instructure/ui-view'
import { Heading } from '@instructure/ui-heading'
import IssueRuleSelect from './IssueRuleSelect';

const issueTypes = [
  'error',
  'suggestion'
]

const issueStatus = [
  'active',
  'fixed',
  'resolved'
]

class ContentTrayForm extends React.Component {

  constructor(props) {
    super(props);

    this.handleContentTypeChange = this.handleContentTypeChange.bind(this)
    this.handleIssueStatusChange = this.handleIssueStatusChange.bind(this)
    this.handleUnpublishedContent = this.handleUnpublishedContent.bind(this)
    this.handleIssueTypeChange = this.handleIssueTypeChange.bind(this)
    this.handleIssueTitleChange = this.handleIssueTitleChange.bind(this)
  }

  render() {
console.log('render', this.props.filters)
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
              name="ContentTypes"
              description={ this.props.t('label.content_type')}
              value={this.props.filters.contentTypes}
              onChange={this.handleContentTypeChange}>
              {this.renderContentTypeCheckboxes()}
            </CheckboxGroup>
          </View>
          <View as="div" padding="small 0">
            <CheckboxGroup
              name="IssueStatus"
              description={this.props.t('label.issue_status')}
              value={this.props.filters.issueStatus}
              onChange={this.handleIssueStatusChange}>
              {this.renderIssueStatusCheckboxes()}
            </CheckboxGroup>
          </View>
          <View as="div" padding="small 0">
            <CheckboxGroup
              name="IssueTypes"
              description={this.props.t('label.issue_type')}
              value={this.props.filters.issueTypes}
              onChange={this.handleIssueTypeChange}>
              {this.renderIssueTypeCheckboxes()}
            </CheckboxGroup>
          </View>
          <View as="div" padding="small 0">
            <Checkbox
              label={this.props.t('label.hide_unpublished')}
              onChange={this.handleUnpublishedContent}
              checked={this.props.filters.hideUnpublishedContentItems}
            />
          </View>
          <View as="div" padding="small 0">
            <IssueRuleSelect 
              options={this.getRuleOptions()} 
              t={this.props.t}
              issueTitles={this.props.filters.issueTitles}
              handleIssueTitleChange={this.handleIssueTitleChange} />
          </View>
        </View> 
      </Tray>
    );
  }

  renderContentTypeCheckboxes() {
    return this.props.settings.contentTypes.map((type) => <Checkbox label={this.props.t(`content.plural.${type}`)} value={type} key={type} />);
  }
  
  renderIssueStatusCheckboxes() {
    return issueStatus.map((status) => <Checkbox label={this.props.t(`label.filter.${status}`)} value={status} key={`status.${status}`} />)
  }

  renderIssueTypeCheckboxes() {
    return issueTypes.map((type) => <Checkbox label={this.props.t(`label.plural.${type}`)} value={type} key={type} />);
  }

  handleContentTypeChange(values) {
    this.props.handleFilter({contentTypes: values});
  }

  handleIssueStatusChange(values) {
    this.props.handleFilter({issueStatus: values})
  }

  handleIssueTypeChange(values) {
    this.props.handleFilter({issueTypes: values});
  }

  handleIssueTitleChange(values) {
    this.props.handleFilter({issueTitles: values});
  }

  handleUnpublishedContent(e) {
    this.props.handleFilter({ hideUnpublishedContentItems: !this.props.filters.hideUnpublishedContentItems });
  }

  getRuleOptions() {
    let ruleOptions = {};

    Object.values(this.props.report.issues).forEach(
      (issue) => {
        ruleOptions[issue.scanRuleId] = {
          id: issue.scanRuleId,
          label: this.props.t(`rule.label.${issue.scanRuleId}`)
        };
      }
    );

    return Object.values(ruleOptions).sort((a, b) => (a.label.toLowerCase() < b.label.toLowerCase()) ? -1 : 1);
  }
}

export default ContentTrayForm;