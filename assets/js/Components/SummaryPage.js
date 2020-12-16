import React from 'react';
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { Table } from '@instructure/ui-table'
import { Pill } from '@instructure/ui-pill'
import { Badge } from '@instructure/ui-badge'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { MetricGroup, Metric } from '@instructure/ui-metric'
import { Link } from '@instructure/ui-link'
import { IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'

const contentTypes = [
  "announcement",
  "assignment",
  "file",
  "page",
  "discussion",
  "syllabus",
  "moduleUrl"
]

class SummaryPage extends React.Component {

  constructor(props) {
    super(props);

    this.handleContentTypeLink = this.handleContentTypeLink.bind(this)
    this.handleIssueTypeLink = this.handleIssueTypeLink.bind(this)
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
    const report = this.props.report;
    this.processReportData(report);
    const date = new Date(report.created);
    const dateParts = date.toISOString().split('T');

    return (
      <View as="div" padding="small 0">
        <Flex alignItems="start">
          <Flex.Item shouldGrow shouldShrink>
            <Heading>{this.props.t('label.summary')} <Pill>{dateParts[0]}</Pill></Heading>        
            <View as="div" margin="small 0"></View>
          </Flex.Item>
          <Flex.Item>
            <Button onClick={() => this.props.handleNavigation('content')} color="primary" textAlign="center" >{this.props.t('button.get_started')}</Button>
          </Flex.Item>
        </Flex>        

        {/* Total Counts */}
        <View as="div" margin="medium">
          <MetricGroup lineHeight="2">
            <Metric renderLabel={this.props.t('label.plural.error')} renderValue={report.errors} />
            <Metric renderLabel={this.props.t('label.plural.suggestion')} renderValue={report.suggestions} />
            <Metric renderLabel={this.props.t('label.fixed')} renderValue={report.contentFixed} />
            <Metric renderLabel={this.props.t('label.manually_resolved')} renderValue={report.contentResolved} />
            <Metric renderLabel={this.props.t('label.files_reviewed')} renderValue={report.filesReviewed} />
          </MetricGroup>
        </View>

        {/* Summary Tables */}
        <Flex alignItems="stretch" justifyItems="space-between">
          <Flex.Item shouldGrow shouldShrink margin="0 medium 0 0">
            <Table
              caption={this.props.t('label.content')}
              layout="auto"
              hover={true}
            >
              <Table.Head>
                <Table.Row>
                    <Table.ColHeader id="content">
                      {this.props.t('label.content')}
                    </Table.ColHeader>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {Object.values(this.contentResults).map((val, ind) => {
                  const key = Object.keys(this.contentResults)[ind];
                  return (
                  <Table.Row key={key}>
                    <Table.Cell>
                      <Flex>
                        <Flex.Item shouldGrow shouldShrink>
                          <Link 
                            isWithinText={false}
                            onClick={() => this.handleContentTypeLink(key)}>{this.props.t(`content.plural.${key}`)}</Link>
                        </Flex.Item>
                        <Flex.Item>
                          <Link onClick={() => this.handleIssueTypeLink(key, 'suggestion')}>
                            <Pill color="alert" margin="x-small">
                              {val.suggestion} {this.props.t('label.plural.suggestion')}</Pill>
                          </Link>
                          <Link onClick={() => this.handleIssueTypeLink(key, 'error')}>
                            <Pill color="danger" margin="x-small">
                              {val.error} {this.props.t('label.plural.error')}</Pill>
                          </Link>
                        </Flex.Item>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>)
                })}
              </Table.Body>
            </Table>
          </Flex.Item>
          <Flex.Item shouldGrow shouldShrink margin="0 0 0 medium">
            {Object.keys(this.issueResults).map((issueType) => {
              const results = this.issueResults[issueType];

              return (
                <Table
                  caption={this.props.t('label.plural.error')}
                  layout="auto"
                  hover={true}
                  margin="0 0 medium 0"
                  key={`${issueType}Table`}>
                  <Table.Head>
                    <Table.Row>
                        <Table.ColHeader id="issuesError">
                          {('error' === issueType ) ? <IconNoLine color="error" /> : <IconInfoBorderlessLine color="alert" />}
                          <View padding="x-small">{this.props.t(`label.plural.${issueType}`)}</View>
                        </Table.ColHeader>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {results.map((val, ind) => {

                      return (
                        <Table.Row key={ind}>
                          <Table.Cell key={ind}>
                            <Flex justifyItems="space-between">
                              <Flex.Item shouldGrow shouldShrink>
                                <Link 
                                  isWithinText={false}
                                  onClick={() => this.handleIssueTitleLink(val[0])}>{this.props.t(`rule.label.${val[0]}`)}</Link>
                              </Flex.Item>
                              <Flex.Item>
                                <Badge standalone variant="danger" count={val[1]} countUntil={100} margin="0 small 0 0" />
                              </Flex.Item>
                            </Flex>
                          </Table.Cell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table>
              );
            })} 
          </Flex.Item>
        </Flex>
      </View>
    )
  }

  handleContentTypeLink(type) {
    this.props.handleAppFilters({contentTypes: [type]});
    this.props.handleNavigation('content');
  }

  handleIssueTypeLink(contentType, issueType) {
    this.props.handleAppFilters({contentTypes: [contentType], issueTypes: [issueType]});
    this.props.handleNavigation('content');
  }

  handleIssueTitleLink(ruleId) {
    this.props.handleAppFilters({issueTitles: [ruleId]});
    this.props.handleNavigation('content');
  }
}

export default SummaryPage;