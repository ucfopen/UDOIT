import React, { useState } from 'react'
import { Table } from '@instructure/ui-table'
import { Text } from '@instructure/ui-text'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { IconArrowOpenEndLine } from '@instructure/ui-icons'
import { MetricGroup, Metric } from '@instructure/ui-metric'
import { IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'
import { DrawerLayout } from '@instructure/ui-drawer-layout'
import Classes from '../../css/theme-overrides.css'

import SummaryForm from './SummaryForm'

export default function SummaryPage({ report, t, handleAppFilters, handleNavigation, settings }) {

  const processReportData = () => {
    let issueResults = {
      error: [],
      suggestion: []
    };

    let contentResults = {};

    if (report && report.issues) {
      for (let issueId in report.issues) {
        const issue = report.issues[issueId];
        const contentItem = report.contentItems[issue.contentItemId];

        if (issue.status) {
          continue;
        }

        if (contentItem && contentItem.contentType) {
          if (!contentResults[contentItem.contentType]) {
            contentResults[contentItem.contentType] = {
              error: 0,
              suggestion: 0
            };
          }
          contentResults[contentItem.contentType][issue.type]++;
        }

        if(!issueResults[issue.type].hasOwnProperty(issue.scanRuleId)) {
          issueResults[issue.type][issue.scanRuleId] = 0;
        }
        issueResults[issue.type][issue.scanRuleId]++;
      }


      for (const type in issueResults) {
        for (const ruleId in issueResults[type]) {
          issueResults[type].push([ruleId, issueResults[type][ruleId]]);
        }
      }

      issueResults.error.sort((a, b) => (a[1] > b[1]) ? -1 : 1 );
      issueResults.suggestion.sort((a, b) => (a[1] > b[1]) ? -1 : 1);
    }

    return { issueResults, contentResults }
  }

  const handleIssueTitleLink = (ruleId) => {
    handleAppFilters({issueTitles: [ruleId]});
    handleNavigation('content');
  }

  const handleMetricClick = (val) => {
    handleAppFilters({issueTypes: [val] })
    handleNavigation('content')
  }

  const renderSummaryTables = () => {
    const { issueResults, contentResults } = processReportData()
    const maxRows = 3

    return (
      <View as="div" margin="0 large 0 0">
        <View as="div" margin="small 0">
          <Text size="large">
            <IconNoLine className={Classes.error} />
            <View padding="0 small">{`${report.errors} ${t(`label.plural.error`)}`}</View>
          </Text>
        </View>
        <Table
          caption={t('label.plural.error')}
          layout="auto"
          hover={true}
          margin="0 0 large 0"
          key={`errorTable`}>
          <Table.Head>
            <Table.Row>
              <Table.ColHeader id="issuesError">
                {t(`label.most_common`) + ' ' + t(`label.plural.error`)}
              </Table.ColHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {issueResults['error'].map((val, ind) => {
              if (ind >= maxRows) {
                return
              }

              return (
                <Table.Row key={ind}>
                  <Table.Cell key={ind} onClick={() => handleIssueTitleLink(val[0])}>
                    <Flex justifyItems="space-between">
                      <Flex.Item shouldGrow shouldShrink>
                        <View as="div">
                          <View display="inline-block" width="30px" textAlign="center" className={Classes.error}>
                            {val[1]}
                          </View>
                          <View padding="0 x-small">{t(`rule.label.${val[0]}`)}</View>
                        </View>
                      </Flex.Item>
                      <Flex.Item>
                        <View as="div" onClick={() => handleIssueTitleLink(val[0])}>
                          <IconArrowOpenEndLine />
                        </View>
                      </Flex.Item>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
        <View as="div" padding="large 0 small 0">
          <Text size="large">
            <IconInfoBorderlessLine className={Classes.suggestion} />
            <View padding="0 small">{`${report.suggestions} ${t(`label.plural.suggestion`)}`}</View>
          </Text>
        </View>
        <Table
          caption={t('label.plural.suggestion')}
          layout="auto"
          hover={true}
          margin="0 0 medium 0"
          key={`suggestionTable`}>
          <Table.Head>
            <Table.Row>
              <Table.ColHeader id="issuesSuggestion">
                {t(`label.most_common`) + ' ' + t(`label.plural.suggestion`)}
              </Table.ColHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {issueResults['suggestion'].map((val, ind) => {
              if (ind >= maxRows) {
                return
              }

              return (
                <Table.Row key={ind}>
                  <Table.Cell key={ind} onClick={() => handleIssueTitleLink(val[0])}>
                    <Flex justifyItems="space-between">
                      <Flex.Item shouldGrow shouldShrink>
                        <View as="div">
                          <View display="inline-block" width="30px" textAlign="center" className={Classes.suggestion}>
                            {val[1]}
                          </View>
                          <View padding="0 x-small">{t(`rule.label.${val[0]}`)}</View>
                        </View>
                      </Flex.Item>
                      <Flex.Item>
                        <IconArrowOpenEndLine />
                      </Flex.Item>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </View>
    )
  }

  return (
    <View as="div">
      {/* <Heading margin="0 0 small 0">{t('label.summary')}</Heading> */}
      <DrawerLayout>
        <DrawerLayout.Content label={t('label.summary')}>
          <View as="div" padding="0 0 medium 0">
            <View as="div" margin="large">
              <MetricGroup lineHeight="2">
                <Metric renderLabel={t('label.plural.fixed')} renderValue={report.contentFixed} />
                <Metric renderLabel={t('label.manually_resolved')} renderValue={report.contentResolved} />
                <Metric renderLabel={t('label.files_reviewed')} renderValue={report.filesReviewed} />
              </MetricGroup>
            </View>
          </View>
          { renderSummaryTables() }
        </DrawerLayout.Content>
        <DrawerLayout.Tray
          id="summaryTray"
          open={true}
          border={false}
          shadow={false}
          placement="end"
          label={t('label.summary.tray')}
        >
          <View as="div"
            width="320px"
            borderColor="brand"
            borderWidth="small"
            borderRadius="large"
            margin="medium 0 0 0"
            >
            <SummaryForm
              t={t}
              report={report}
              handleAppFilters={handleAppFilters}
              handleNavigation={handleNavigation}
              settings={settings} />
          </View>
        </DrawerLayout.Tray>
      </DrawerLayout>
    </View>
  )
}