import React, { useState } from 'react'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import { InlineList } from '@instructure/ui-list'
import { IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'
import { RadioInput, RadioInputGroup } from '@instructure/ui-radio-input'
import { SimpleSelect } from '@instructure/ui-simple-select'
import { issueRuleIds } from './Constants'
import Classes from '../../css/theme-overrides.css'

const startOptions = [
  'easy',
  'errors_only',
  'active',
  'by_issue',
  'by_content',
  'by_impact'
]

export default function SummaryForm({ t, settings, report, handleAppFilters, handleNavigation }) {
  const [selectFilter, setSelectFilter] = useState('easy')
  const [selectRule, setSelectRule] = useState('')
  const [selectContentType, setSelectContentType] = useState('')
  const [selectImpact, setSelectImpact] = useState('')

  const visualRules = issueRuleIds.filter(rule => settings.visualRuleIds.includes(rule))
  const auditoryRules = issueRuleIds.filter(rule => settings.auditoryRuleIds.includes(rule))
  const cognitiveRules = issueRuleIds.filter(rule => settings.cognitiveRuleIds.includes(rule))
  const motorRules = issueRuleIds.filter(rule => settings.motorRuleIds.includes(rule))
  const easyRules = issueRuleIds.filter(rule => settings.easyRuleIds.includes(rule))

  const checkCanSubmit = () => {
    let newCanSubmit = true
    if (selectFilter === 'by_issue') {
      newCanSubmit = selectRule
    }
    if (selectFilter === 'by_content') {
      newCanSubmit = selectContentType
    }
    if (selectFilter === 'by_impact') {
      newCanSubmit = selectImpact
    }
    return newCanSubmit;
  }
  const canSubmit = checkCanSubmit()

  const handleFilterSelect = (e, val) => {
    setSelectFilter(val)
  }

  const handleRuleSelect = (e, val) => {
    setSelectRule(val.id)
  }

  const handleContentTypeSelect = (e, val) => {
    setSelectContentType(val.id)
  }

  const handleImpactSelect = (e, val) => {
    setSelectImpact(val.id)
  }

  const handleSubmit = (e) => {
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

    handleAppFilters(filters)
    handleNavigation('content')
  }

  const renderIssueOptions = () => {
    let options = {}
    let out = [
      <SimpleSelect.Option value="" id="option-none" key="summary-none">--</SimpleSelect.Option>
    ]

    for (const issue of report.issues) {
      options[issue.scanRuleId] = issue.type
    }

    for (let ruleId of Object.keys(options)) {
      out.push(<SimpleSelect.Option value={ruleId} id={ruleId} key={`summary-${ruleId}`}>{t(`rule.label.${ruleId}`)}</SimpleSelect.Option>)
    }

    return out
  }

  const renderContentTypeOptions = () => {
    let types = settings.contentTypes
    let out = [
      <SimpleSelect.Option value="" id="option-none" key="summary-none">--</SimpleSelect.Option>
    ]

    types.sort()

    for (let type of types) {
      out.push(<SimpleSelect.Option value={type} id={type} key={`summary-${type}`}>{t(`content.plural.${type}`)}</SimpleSelect.Option>)
    }

    return out
  }

  const renderImpactOptions = () => {
    let impacts = ['visual', 'auditory', 'cognitive', 'motor']
    let out = [
      <SimpleSelect.Option value="" id="option-none" key="summary-none">--</SimpleSelect.Option>
    ]

    for (let impact of impacts) {
      out.push(<SimpleSelect.Option value={impact} id={impact} key={`summary-${impact}`}>{t(`label.filter.${impact}`)}</SimpleSelect.Option>)
    }

    return out
  }

  const renderIssueCount = () => {
    let values = ['-', '-']

    switch (selectFilter) {
      case 'easy':
        values = getEasyCount()
        break
      case 'errors_only':
        values = getErrorCount()
        break
      case 'active':
        values = getActiveIssueCount()
        break
      case 'by_issue':
        if (selectRule) {
          values = getIssueTypeCount()
        }
        break
      case 'by_content':
        if (selectContentType) {
          values = getContentTypeCount()
        }
        break
      case 'by_impact':
        if (selectImpact) {
          values = getImpactCount()
        }
        break
    }

    return (
      <InlineList>
        {values[0] &&
        <InlineList.Item>
          <IconNoLine className={Classes.error} />
          <View padding="0 0 0 xx-small">{values[0]} {t('label.plural.error')}</View>
        </InlineList.Item>}
        {values[1] &&
        <InlineList.Item>
          <IconInfoBorderlessLine className={Classes.suggestion} />
          <View padding="0 0 0 xx-small">{values[1]} {t('label.plural.suggestion')}</View>
        </InlineList.Item>}
      </InlineList>
    )
  }

  const getEasyCount = () => {
    let errors = 0
    let suggestions = 0

    for (const issue of report.issues) {
      if (issue.status) {
        continue
      }

      if (easyRules.includes(issue.scanRuleId)) {
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

  const getErrorCount = () => {
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

  const getActiveIssueCount = () => {
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

  const getIssueTypeCount = () => {
    let errors = 0
    let suggestions = 0

    for (const issue of report.issues) {
      if (issue.status) {
        continue
      }
      if (selectRule === issue.scanRuleId) {
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

  const getContentTypeCount = () => {
    let errors = 0
    let suggestions = 0

    for (const issue of report.issues) {
      if (issue.status) {
        continue
      }
      const contentItem = Object.assign({}, report.contentItems[issue.contentItemId])

      if (selectContentType === contentItem.contentType) {
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

  const getImpactCount = () => {
    let errors = 0
    let suggestions = 0

    for (const issue of report.issues) {
      if (issue.status) {
        continue
      }

      if ((selectImpact === 'visual' && visualRules.includes(issue.scanRuleId))
          || (selectImpact === 'auditory' && auditoryRules.includes(issue.scanRuleId))
          || (selectImpact === 'cognitive' && cognitiveRules.includes(issue.scanRuleId))
          || (selectImpact === 'motor' && motorRules.includes(issue.scanRuleId))
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

  return (
    <View as="div" padding="medium">
      <Heading level="h3" as="h2">{t('form.summary.heading')}</Heading>
      <View as="div" margin="large 0 0 0">
        <RadioInputGroup onChange={handleFilterSelect}
          name="summaryFilterSelect"
          value={selectFilter}
          description={t('form.summary.show')}>
            {startOptions.map((key) => <RadioInput key={key} value={key} label={t(`form.summary.option.${key}`)} /> )}
        </RadioInputGroup>

        {('by_issue' === selectFilter) &&
          <View as="div" margin="large 0">
            <SimpleSelect
              value={selectRule}
              name="selectRule"
              renderLabel={t('form.summary.option.by_issue')}
              onChange={handleRuleSelect}>
              {renderIssueOptions()}
            </SimpleSelect>
          </View>
        }

        {('by_content' === selectFilter) &&
          <View as="div" margin="large 0">
            <SimpleSelect
              value={selectContentType}
              name="selectContentType"
              renderLabel={t('form.summary.option.by_content')}
              onChange={handleContentTypeSelect}>
              {renderContentTypeOptions()}
            </SimpleSelect>
          </View>
        }

        {('by_impact' === selectFilter) &&
          <View as="div" margin="large 0">
            <SimpleSelect
              value={selectImpact}
              name="selectImpact"
              renderLabel={t('form.summary.option.by_impact')}
              onChange={handleImpactSelect}>
              {renderImpactOptions()}
            </SimpleSelect>
          </View>
        }

        <View as="div" margin="medium 0">
          {renderIssueCount()}
        </View>
        <View as="div" margin="medium 0 0 0">
          <Button
            color="primary"
            display="block"
            onClick={handleSubmit}
            interaction={canSubmit ? 'enabled' : 'disabled'}
            >{t('button.start')}</Button>
        </View>
      </View>
    </View>
  )
}