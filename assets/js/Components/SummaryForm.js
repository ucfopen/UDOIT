import React from 'react'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import { InlineList, List } from '@instructure/ui-list'
import { IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'
import { RadioInput, RadioInputGroup } from '@instructure/ui-radio-input'
import { SimpleSelect } from '@instructure/ui-simple-select'
import { issueRuleIds } from './Constants'
import Classes from '../../css/theme-overrides.scss'

const startOptions = [
  'easy',
  'errors_only',
  'active',
  'by_issue',
  'by_content',
  'by_impact'
]

class SummaryForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectFilter: 'easy',
      selectRule: '',
      selectContentType: '',
      selectImpact: '',
    }

    this.visualRules = issueRuleIds.filter(rule => this.props.settings.visualRuleIds.includes(rule))
    this.auditoryRules = issueRuleIds.filter(rule => this.props.settings.auditoryRuleIds.includes(rule))
    this.cognitiveRules = issueRuleIds.filter(rule => this.props.settings.cognitiveRuleIds.includes(rule))
    this.motorRules = issueRuleIds.filter(rule => this.props.settings.motorRuleIds.includes(rule))

    this.handleFilterSelect = this.handleFilterSelect.bind(this)
    this.handleRuleSelect = this.handleRuleSelect.bind(this)
    this.handleContentTypeSelect = this.handleContentTypeSelect.bind(this)
    this.handleImpactSelect = this.handleImpactSelect.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  render() {
    let canSubmit = true
    let easyRuleIds = this.props.settings.easyRuleIds
    if ('by_issue' === this.state.selectFilter) {
      canSubmit = (this.state.selectRule)
    }
    if ('by_content' === this.state.selectFilter) {
      canSubmit = (this.state.selectContentType)
    }
    if ('by_impact' === this.state.selectFilter) {
      canSubmit = (this.state.selectImpact)
    }

    this.easyRules = issueRuleIds.filter(rule => easyRuleIds.includes(rule))



    return (
      <View as="div" padding="medium">
        <Heading level="h3" as="h2">{this.props.t('form.summary.heading')}</Heading>
        {/* <Text as="p">{this.props.t('form.summary.description')}</Text> */}
        <View as="div" margin="large 0 0 0">
          <RadioInputGroup onChange={this.handleFilterSelect}
            name="summaryFilterSelect"
            value={this.state.selectFilter}
            description={this.props.t('form.summary.show')}>
              {startOptions.map((key) => <RadioInput key={key} value={key} label={this.props.t(`form.summary.option.${key}`)} /> )}
          </RadioInputGroup>

          {('by_issue' === this.state.selectFilter) &&
            <View as="div" margin="large 0">
              <SimpleSelect
                value={this.state.selectRule}
                name="selectRule"
                renderLabel={this.props.t('form.summary.option.by_issue')}
                onChange={this.handleRuleSelect}>
                {this.renderIssueOptions()}
              </SimpleSelect>
            </View>
          }

          {('by_content' === this.state.selectFilter) &&
            <View as="div" margin="large 0">
              <SimpleSelect
                value={this.state.selectContentType}
                name="selectContentType"
                renderLabel={this.props.t('form.summary.option.by_content')}
                onChange={this.handleContentTypeSelect}>
                {this.renderContentTypeOptions()}
              </SimpleSelect>
            </View>
          }

          {('by_impact' === this.state.selectFilter) &&
            <View as="div" margin="large 0">
              <SimpleSelect
                value={this.state.selectImpact}
                name="selectImpact"
                renderLabel={this.props.t('form.summary.option.by_impact')}
                onChange={this.handleImpactSelect}>
                {this.renderImpactOptions()}
              </SimpleSelect>
            </View>
          }

          <View as="div" margin="medium 0">
            {this.renderIssueCount()}
          </View>
          <View as="div" margin="medium 0 0 0">
            <Button
              color="primary"
              display="block"
              onClick={this.handleSubmit}
              interaction={canSubmit ? 'enabled' : 'disabled'}
              >{this.props.t('button.start')}</Button>
          </View>
        </View>
      </View>
    )
  }

  handleFilterSelect(e, val)
  {
    this.setState({selectFilter: val})
  }

  handleRuleSelect(e, val)
  {
    this.setState({selectRule: val.id})
  }

  handleContentTypeSelect(e, val)
  {
    this.setState({ selectContentType: val.id })
  }

  handleImpactSelect(e, val)
  {
    this.setState({ selectImpact: val.id })
  }

  handleSubmit(e)
  {
    const { selectFilter, selectRule, selectContentType, selectImpact} = this.state
    let filters = {}

    switch (selectFilter) {
      case 'easy':
        filters = {easyIssues: true}
      break
      case 'errors_only':
        filters = {issueTypes: ['error']}
      break
      case 'active':
        filters = {issueStatus: ['active']}
      break
      case 'by_issue':
        filters = {issueTitles: [selectRule]}
      break
      case 'by_content':
        filters = {contentTypes: [selectContentType]}
      break
      case 'by_impact':
        filters = {issueImpacts: [selectImpact]}
      break
    }

    this.props.handleAppFilters(filters);
    this.props.handleNavigation('content');
  }

  renderIssueOptions() {
    let options = {}
    let out = [
      <SimpleSelect.Option value="" id="option-none" key="summary-none">--</SimpleSelect.Option>
    ]

    for (const issue of this.props.report.issues) {
      options[issue.scanRuleId] = issue.type
    }

    for (let ruleId of Object.keys(options)) {
      out.push(<SimpleSelect.Option value={ruleId} id={ruleId} key={`summary-${ruleId}`}>{this.props.t(`rule.label.${ruleId}`)}</SimpleSelect.Option>)
    }

    return out
  }

  renderContentTypeOptions() {
    let types = this.props.settings.contentTypes
    let out = [
      <SimpleSelect.Option value="" id="option-none" key="summary-none">--</SimpleSelect.Option>
    ]

    types.sort()

    for (let type of types) {
      out.push(<SimpleSelect.Option value={type} id={type} key={`summary-${type}`}>{this.props.t(`content.plural.${type}`)}</SimpleSelect.Option>)
    }

    return out
  }

  renderImpactOptions() {
    let impacts = ['visual', 'auditory', 'cognitive', 'motor']
    let out = [
      <SimpleSelect.Option value="" id="option-none" key="summary-none">--</SimpleSelect.Option>
    ]

    for (let impact of impacts) {
      out.push(<SimpleSelect.Option value={impact} id={impact} key={`summary-${impact}`}>{this.props.t(`label.filter.${impact}`)}</SimpleSelect.Option>)
    }

    return out
  }

  renderIssueCount() {
    let values = ['-', '-']

    switch (this.state.selectFilter) {
      case 'easy':
        values = this.getEasyCount()
        break
      case 'errors_only':
        values = this.getErrorCount()
        break
      case 'active':
        values = this.getActiveIssueCount()
        break
      case 'by_issue':
        if (this.state.selectRule) {
          values = this.getIssueTypeCount()
        }
        break
      case 'by_content':
        if (this.state.selectContentType) {
          values = this.getContentTypeCount()
        }
        break
      case 'by_impact':
        if (this.state.selectImpact) {
          values = this.getImpactCount()
        }
        break
    }

    return (
      <InlineList>
        {values[0] &&
        <InlineList.Item>
          <IconNoLine className={Classes.error} />
          <View padding="0 0 0 xx-small">{values[0]} {this.props.t('label.plural.error')}</View>
        </InlineList.Item>}
        {values[1] &&
        <InlineList.Item>
          <IconInfoBorderlessLine className={Classes.suggestion} />
          <View padding="0 0 0 xx-small">{values[1]} {this.props.t('label.plural.suggestion')}</View>
        </InlineList.Item>}
      </InlineList>
    )
  }

  getEasyCount() {
    const report = this.props.report
    let errors = 0
    let suggestions = 0

    for (const issue of report.issues) {
      if (issue.status) {
        continue
      }

      if (this.easyRules.includes(issue.scanRuleId)) {
        if ('error' === issue.type) {
          errors++
        }
        else {
          suggestions++
        }
      }
    }

    return [errors, suggestions]
  }

  getErrorCount() {
    const report = this.props.report
    let errors = 0

    for (const issue of report.issues) {
      if (issue.status) {
        continue
      }
      if ('error' === issue.type) {
        errors++
      }
    }

    return [errors, 0]
  }

  getActiveIssueCount() {
    const report = this.props.report
    let errors = 0
    let suggestions = 0

    for (const issue of report.issues) {
      if (issue.status) {
        continue
      }
      if ('error' === issue.type) {
        errors++
      }
      else {
        suggestions++
      }
    }

    return [errors, suggestions]
  }

  getIssueTypeCount() {
    const report = this.props.report
    let errors = 0
    let suggestions = 0

    for (const issue of report.issues) {
      if (issue.status) {
        continue
      }
      if (this.state.selectRule === issue.scanRuleId) {
        if ('error' === issue.type) {
          errors++
        }
        else {
          suggestions++
        }
      }
    }

    return [errors, suggestions]
  }

  getContentTypeCount() {
    const report = this.props.report
    let errors = 0
    let suggestions = 0

    for (const issue of report.issues) {
      if (issue.status) {
        continue
      }
      const contentItem = Object.assign({}, report.contentItems[issue.contentItemId])

      if (this.state.selectContentType === contentItem.contentType) {
        if ('error' === issue.type) {
          errors++
        }
        else {
          suggestions++
        }
      }
    }

    return [errors, suggestions]
  }

  getImpactCount() {
    const report = this.props.report
    let errors = 0
    let suggestions = 0

    for (const issue of report.issues) {
      if (issue.status) {
        continue
      }

      if ((this.state.selectImpact === 'visual' && this.visualRules.includes(issue.scanRuleId))
          || (this.state.selectImpact === 'auditory' && this.auditoryRules.includes(issue.scanRuleId))
          || (this.state.selectImpact === 'cognitive' && this.cognitiveRules.includes(issue.scanRuleId))
          || (this.state.selectImpact === 'motor' && this.motorRules.includes(issue.scanRuleId))
          ) {
        if ('error' === issue.type) {
          errors++
        }
        else {
          suggestions++
        }
      }
    }

    return [errors, suggestions]
  }
}

export default SummaryForm
