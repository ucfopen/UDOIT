import React from 'react'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { Text } from '@instructure/ui-text'
import { Heading } from '@instructure/ui-heading'
import { IconDownloadLine } from '@instructure/ui-icons'

import Api from '../../Services/Api'
import { Spinner } from '@instructure/ui-spinner'

import IssuesReport from '../Reports/IssuesReport'
import ResolutionsReport from '../Reports/ResolutionsReport'
import ReportsTable from '../Reports/ReportsTable'

class ReportsPage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      reports: []
    }
  }

  componentDidMount() {
    if (this.state.reports.length === 0) {
      this.getReportHistory()
    }
  }

  render() {
    let reports = Object.values(this.state.reports)

    for (let report of reports) {
      report.id = report.created
    }

    if (this.state.reports.length === 0) {
      return (
        <View as="div" padding="small 0">
          <View as="div" textAlign="center" padding="medium">
            <Spinner variant="inverse" renderTitle={this.props.t('label.loading_reports')} />
            <Text as="p" weight="light" size="large">{this.props.t('label.loading_reports')}</Text>
          </View>
        </View>
      )
    } else {
      return (
        <View as="div" padding="small 0">
          {/* <Heading>{this.props.t('label.reports')}</Heading> */}
          <View as="div" margin="0 0 large 0">
            <Flex justifyItems="space-between" alignItems="start">
              <Flex.Item width="48%" padding="0">
                <IssuesReport t={this.props.t} reports={reports} />
              </Flex.Item>
              <Flex.Item width="48%" padding="0">
                <ResolutionsReport t={this.props.t} reports={reports} />
              </Flex.Item>
            </Flex>
          </View>
          <View as="div" margin="large 0">
            <ReportsTable
              reports={reports}
              t={this.props.t}
              isAdmin={true}
            />
          </View>
        </View>
      )
    }
  }

  getReportHistory() {
    const api = new Api(this.props.settings)
    api.getAdminReportHistory(this.props.accountId, this.props.termId)
      .then((responseStr) => responseStr.json())
      .then((response) => {
        console.log('Admin Reports', response.data)
        this.setState({ reports: response.data })
      })
  }
}

export default ReportsPage