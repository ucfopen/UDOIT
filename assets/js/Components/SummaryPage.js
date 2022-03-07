import React from 'react'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
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

class SummaryPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showMoreSummary: false
    }

    //this.handleIssueTypeLink = this.handleIssueTypeLink.bind(this)
    //this.handleShowMore = this.handleShowMore.bind(this)
  }

  processReportData(report) {
    let issueResults = {
      error: {},
      suggestion: {}
    };

    this.contentResults = {};
    this.issueResults = {
      error: [],
      suggestion: []
    };

    if (report && report.issues) {
      for (let issueId in report.issues) {
        const issue = report.issues[issueId];
        const contentItem = report.contentItems[issue.contentItemId];

        if (issue.status) {
          continue;
        }

        if (contentItem && contentItem.contentType) {
          if (!this.contentResults[contentItem.contentType]) {
            this.contentResults[contentItem.contentType] = {
              error: 0,
              suggestion: 0
            };
          }
          this.contentResults[contentItem.contentType][issue.type]++;
        }

        if(!issueResults[issue.type].hasOwnProperty(issue.scanRuleId)) {
          issueResults[issue.type][issue.scanRuleId] = 0;
        }
        issueResults[issue.type][issue.scanRuleId]++;
      }


      for (const type in issueResults) {
        for (const ruleId in issueResults[type]) {
          this.issueResults[type].push([ruleId, issueResults[type][ruleId]]);
        }
      }

      this.issueResults.error.sort((a, b) => (a[1] > b[1]) ? -1 : 1 );
      this.issueResults.suggestion.sort((a, b) => (a[1] > b[1]) ? -1 : 1);
    }
  }

  render() {
    const report = this.props.report
    const infoLabel = (this.state.showMoreSummary) ? 'label.less_info' : 'label.more_info'

    return (
      <View as="div">
        {/* <Heading margin="0 0 small 0">{this.props.t('label.summary')}</Heading> */}
        <DrawerLayout>
          <DrawerLayout.Content label={this.props.t('label.summary')}>
            <View as="div" padding="0 0 medium 0">
              <View as="div" margin="large">
                <MetricGroup lineHeight="2">
                  <Metric renderLabel={this.props.t('label.plural.fixed')} renderValue={report.contentFixed} />
                  <Metric renderLabel={this.props.t('label.manually_resolved')} renderValue={report.contentResolved} />
                  <Metric renderLabel={this.props.t('label.files_reviewed')} renderValue={report.filesReviewed} />
                </MetricGroup>
              </View>
            </View>
            {this.renderSummaryTables()}
          </DrawerLayout.Content>
          <DrawerLayout.Tray
            id="summaryTray"
            open={true}
            border={false}
            shadow={false}
            placement="end"
            label={this.props.t('label.summary.tray')}
          >
            <View as="div"
              width="320px"
              borderColor="brand"
              borderWidth="small"
              borderRadius="large"
              margin="medium 0 0 0"
              >
              <SummaryForm
                t={this.props.t}
                report={report}
                handleAppFilters={this.props.handleAppFilters}
                handleNavigation={this.props.handleNavigation}
                settings={this.props.settings} />
            </View>
          </DrawerLayout.Tray>
        </DrawerLayout>
      </View>
    )
  }

  renderSummaryTables() {
    const report = this.props.report;
    this.processReportData(report)
    const maxRows = 3

    return (
      <View as="div" margin="0 large 0 0">
        <View as="div" margin="small 0">
          <Text size="large">
            <IconNoLine className={Classes.error} />
            <View padding="0 small">{`${report.errors} ${this.props.t(`label.plural.error`)}`}</View>
          </Text>
        </View>
        <Table
          caption={this.props.t('label.plural.error')}
          layout="auto"
          hover={true}
          margin="0 0 large 0"
          key={`errorTable`}>
          <Table.Head>
            <Table.Row>
              <Table.ColHeader id="issuesError">
                {this.props.t(`label.most_common`) + ' ' + this.props.t(`label.plural.error`)}
              </Table.ColHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {this.issueResults['error'].map((val, ind) => {
              if (ind >= maxRows) {
                return
              }

              return (
                <Table.Row key={ind}>
                  <Table.Cell key={ind} onClick={() => this.handleIssueTitleLink(val[0])}>
                    <Flex justifyItems="space-between">
                      <Flex.Item shouldGrow shouldShrink>
                        <View as="div">
                          <View display="inline-block" width="30px" textAlign="center" className={Classes.error}>
                            {val[1]}
                          </View>
                          <View padding="0 x-small">{this.props.t(`rule.label.${val[0]}`)}</View>
                        </View>
                      </Flex.Item>
                      <Flex.Item>
                        <View as="div" onClick={() => this.handleIssueTitleLink(val[0])}>
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
            <View padding="0 small">{`${report.suggestions} ${this.props.t(`label.plural.suggestion`)}`}</View>
          </Text>
        </View>
        <Table
          caption={this.props.t('label.plural.suggestion')}
          layout="auto"
          hover={true}
          margin="0 0 medium 0"
          key={`suggestionTable`}>
          <Table.Head>
            <Table.Row>
              <Table.ColHeader id="issuesSuggestion">
                {this.props.t(`label.most_common`) + ' ' + this.props.t(`label.plural.suggestion`)}
              </Table.ColHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {this.issueResults['suggestion'].map((val, ind) => {
              if (ind >= maxRows) {
                return
              }

              return (
                <Table.Row key={ind}>
                  <Table.Cell key={ind} onClick={() => this.handleIssueTitleLink(val[0])}>
                    <Flex justifyItems="space-between">
                      <Flex.Item shouldGrow shouldShrink>
                        <View as="div">
                          <View display="inline-block" width="30px" textAlign="center" className={Classes.suggestion}>
                            {val[1]}
                          </View>
                          <View padding="0 x-small">{this.props.t(`rule.label.${val[0]}`)}</View>
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

  // handleShowMore(e) {
  //   this.setState({ showMoreSummary: !this.state.showMoreSummary })
  // }

  // handleIssueTypeLink(contentType, issueType) {
  //   this.props.handleAppFilters({contentTypes: [contentType], issueTypes: [issueType]});
  //   this.props.handleNavigation('content');
  // }

  handleIssueTitleLink(ruleId) {
    this.props.handleAppFilters({issueTitles: [ruleId]});
    this.props.handleNavigation('content');
  }

  handleMetricClick(val) {
    this.props.handleAppFilters({issueTypes: [val] })
    this.props.handleNavigation('content')
  }
}

export default SummaryPage;
