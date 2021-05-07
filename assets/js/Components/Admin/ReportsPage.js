import React from 'react'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { Text } from '@instructure/ui-text'
import { IconFilterLine } from '@instructure/ui-icons'
import { Button } from '@instructure/ui-buttons'

import Api from '../../Services/Api'
import { Spinner } from '@instructure/ui-spinner'

import IssuesReport from '../Reports/IssuesReport'
import ResolutionsReport from '../Reports/ResolutionsReport'
import ReportsTable from '../Reports/ReportsTable'

class ReportsPage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      reports: null
    }
  }

  componentDidMount() {
    if (this.state.reports === null) {
      this.getReportHistory()
    }
  }

  render() {
    if (this.state.reports === null) {
      return (
        <View as="div" padding="small 0">
          <View as="div" textAlign="center" padding="medium">
            <Spinner variant="inverse" renderTitle={this.props.t('label.loading_reports')} />
            <Text as="p" weight="light" size="large">{this.props.t('label.loading_reports')}</Text>
          </View>
        </View>
      )
    } 

    let reports = Object.values(this.state.reports)

    for (let report of reports) {
      report.id = report.created
    }

    return (
      <View as="div" padding="small 0">
        <Flex justifyItems="space-between" padding="0 0 medium 0" key="reportsHeader">
          <Flex.Item>
            <View as="div" key="filterTags">
              {this.props.renderFilterTags()}
            </View>
          </Flex.Item>
          <Flex.Item>
            {this.props.handleTrayToggle &&
              <Button
                renderIcon={IconFilterLine}
                screenReaderLabel={this.props.t('srlabel.open_filters_tray')}
                onClick={this.props.handleTrayToggle}
                elementRef={(node) => this.filterButton = node}
              >
                {this.props.t('label.filter')}
              </Button>}
          </Flex.Item>
        </Flex>
        {(reports.length === 0) ? 
          <View as="div">{this.props.t('label.admin.no_results')}</View>
          : 
          <>
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
          </>
        }
      </View>
    )
  }

  getReportHistory() {
    const api = new Api(this.props.settings)
    api.getAdminReportHistory(this.props.filters.accountId, this.props.filters.termId)
      .then((responseStr) => responseStr.json())
      .then((response) => {
        if (!Array.isArray(response.data)) {
          this.setState({ reports: response.data })
        }
        else {
          this.setState({ reports: {} })
        }
        
      })
  }
}

export default ReportsPage