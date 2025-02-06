import React from 'react';
import { Checkbox, CheckboxGroup } from '@instructure/ui-checkbox'
import { CloseButton } from '@instructure/ui-buttons'
import { Flex } from '@instructure/ui-flex'
import { Tray } from '@instructure/ui-tray'
import { View } from '@instructure/ui-view'
import { Heading } from '@instructure/ui-heading'
import IssueRuleSelect from './IssueRuleSelect';

export default function ContentTrayForm({ t, trayOpen, filters, handleTrayToggle, handleFilter, settings, report }) {

  const issueTypes = [
    'error',
    'suggestion'
  ]
  
  const issueStatus = [
    'active',
    'fixed',
    'resolved'
  ]
  
  const issueImpacts = [
    'visual',
    'auditory',
    'cognitive',
    'motor'
  ]
  
  const renderContentTypeCheckboxes = () => {
    return settings.contentTypes.map((type) => <Checkbox label={t(`content.plural.${type}`)} value={type} key={type} />)
  }
  
  const renderIssueStatusCheckboxes = () => {
    return issueStatus.map((status) => <Checkbox label={t(`label.filter.${status}`)} value={status} key={`status.${status}`} />)
  }
  
  const renderIssueTypeCheckboxes = () => {
    return issueTypes.map((type) => <Checkbox label={t(`label.plural.${type}`)} value={type} key={type} />)
  }
  
  const renderIssueImpactCheckboxes = () => {
    return issueImpacts.map((impact) => <Checkbox label={t(`label.filter.${impact}`)} value={impact} key={impact} />)
  }
  
  const handleContentTypeChange = (values) => {
    handleFilter({contentTypes: values})
  }
  
  const handleIssueStatusChange = (values) => {
    handleFilter({issueStatus: values})
  }
  
  const handleIssueTypeChange = (values) => {
    handleFilter({issueTypes: values})
  }
  
  const handleIssueTitleChange = (values) => {
    handleFilter({issueTitles: values})
  }
  
  const handleIssueImpactChange = (values) => {
    handleFilter({issueImpacts: values})
  }
  
  const handleUnpublishedContent = () => {
    handleFilter({ hideUnpublishedContentItems: !filters.hideUnpublishedContentItems });
  }
  
  const handleEasyIssues = () => {
    handleFilter({ easyIssues: !filters.easyIssues });
  }
  
  const getRuleOptions = () => {
    let ruleOptions = {};
  
    Object.values(report.issues).forEach(
      (issue) => {
        ruleOptions[issue.scanRuleId] = {
          id: issue.scanRuleId,
          label: t(`rule.label.${issue.scanRuleId}`)
        };
      }
    );
  
    return Object.values(ruleOptions).sort((a, b) => (a.label.toLowerCase() < b.label.toLowerCase()) ? -1 : 1);
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
            name="ContentTypes"
            description={ t('label.content_type')}
            value={filters.contentTypes}
            onChange={handleContentTypeChange}>
            {renderContentTypeCheckboxes()}
          </CheckboxGroup>
        </View>
        <View as="div" padding="small 0">
          <CheckboxGroup
            name="IssueStatus"
            description={t('label.issue_status')}
            value={filters.issueStatus}
            onChange={handleIssueStatusChange}>
            {renderIssueStatusCheckboxes()}
          </CheckboxGroup>
        </View>
        <View as="div" padding="small 0">
          <CheckboxGroup
            name="IssueTypes"
            description={t('label.issue_type')}
            value={filters.issueTypes}
            onChange={handleIssueTypeChange}>
            {renderIssueTypeCheckboxes()}
          </CheckboxGroup>
        </View>
        <View as="div" padding="small 0">
          <CheckboxGroup
            name="IssueImpacts"
            description={t('label.issue_impact')}
            value={filters.issueImpacts}
            onChange={handleIssueImpactChange}>
            {renderIssueImpactCheckboxes()}
          </CheckboxGroup>
        </View>
        <View as="div" padding="small 0">
          <Checkbox
            label={t('label.hide_unpublished')}
            onChange={handleUnpublishedContent}
            checked={filters.hideUnpublishedContentItems}
          />
        </View>
        <View as="div" padding="small 0">
          <Checkbox
            label={t('label.show_easy_issues')}
            onChange={handleEasyIssues}
            checked={filters.easyIssues}
          />
        </View>
        <View as="div" padding="small 0">
          <IssueRuleSelect
            options={getRuleOptions()}
            t={t}
            issueTitles={filters.issueTitles}
            handleIssueTitleChange={handleIssueTitleChange} />
        </View>
      </View>
    </Tray>
  )
}