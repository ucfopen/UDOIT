import React from 'react'
import '@instructure/canvas-theme'
import WelcomePage from './WelcomePage'
import Header from './Header'
import SummaryPage from './SummaryPage'
import ContentPage from './ContentPage'
import ReportsPage from './ReportsPage'
import AboutModal from './AboutModal'
import { View } from '@instructure/ui-view'
import Api from '../Services/Api'
import MessageTray from './MessageTray'
import FilesPage from './FilesPage'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.initialReport = props.report
    this.appFilters = {}
    this.settings = props.settings
    this.reportHistory = []
    this.messages = props.messages
    this.newReportInterval = 5000

    this.state = {
      report: this.initialReport,
      navigation: 'welcome',
      modal: null,
      syncComplete: false,
      hasNewReport: false,
    }

    this.handleNavigation = this.handleNavigation.bind(this)
    this.handleModal = this.handleModal.bind(this)
    this.handleAppFilters = this.handleAppFilters.bind(this)
    this.clearMessages = this.clearMessages.bind(this)
    this.addMessage = this.addMessage.bind(this)
    this.t = this.t.bind(this)
    this.handleIssueSave = this.handleIssueSave.bind(this)
    this.handleFileSave = this.handleFileSave.bind(this)
    this.handleManualScan = this.handleManualScan.bind(this)
    this.handleCourseRescan = this.handleCourseRescan.bind(this)
    this.handleNewReport = this.handleNewReport.bind(this)
  }

  render() {    
    return (
      <View as="div">
        <Header
          t={this.t}
          settings={this.settings}
          hasNewReport={this.state.hasNewReport}
          navigation={this.state.navigation}
          handleNavigation={this.handleNavigation} 
          handleCourseRescan={this.handleCourseRescan}
          handleModal={this.handleModal} />

        <MessageTray messages={this.messages} t={this.t} clearMessages={this.clearMessages} hasNewReport={this.state.syncComplete} />

        {('welcome' === this.state.navigation) && 
          <WelcomePage 
            handleNavigation={this.handleNavigation} 
            t={this.t}
            settings={this.settings}
            hasNewReport={this.state.hasNewReport} />
        }
        {('summary' === this.state.navigation) &&
          <SummaryPage
            report={this.state.report}
            settings={this.settings}
            handleAppFilters={this.handleAppFilters}
            handleNavigation={this.handleNavigation}
            t={this.t} />
        }
        {('content' === this.state.navigation) &&
          <ContentPage
            report={this.state.report}
            settings={this.settings}
            appFilters={this.appFilters}
            handleAppFilters={this.handleAppFilters}
            handleNavigation={this.handleNavigation}
            handleIssueSave={this.handleIssueSave}
            handleIssueUpdate={this.handleIssueUpdate}
            handleManualScan={this.handleManualScan}
            disableReview={this.disableReview()}
            t={this.t} />
        }
        {('files' === this.state.navigation) &&
          <FilesPage
            report={this.state.report}
            settings={this.settings}
            handleNavigation={this.handleNavigation}
            handleFileSave={this.handleFileSave}
            t={this.t} />
        }
        {('reports' === this.state.navigation) &&
          <ReportsPage
            t={this.t}
            settings={this.settings}
            handleNavigation={this.handleNavigation}
          />
        }
        {('about' === this.state.modal) &&
          <AboutModal t={this.t}
            settings={this.settings}
            handleModal={this.handleModal} />
        }
      </View>
    )
  }

  componentDidMount() {
    if (this.initialReport) {
      this.setState({report: this.initialReport, navigation: 'summary'})
    }
    this.scanCourse()
      .then((response) => response.json())
      .then(this.handleNewReport)
  }

  t(key) {
    return (this.settings.labels[key]) ? this.settings.labels[key] : key
  }

  scanCourse() {
    let api = new Api(this.settings)    
    return api.scanCourse(this.settings.course.id)
  }

  disableReview = () => {
    return this.state.syncComplete && !this.state.disableReview
  }

  handleCourseRescan() {
    if (this.state.hasNewReport) {
      this.setState({ hasNewReport: false, syncComplete: false })
      this.scanCourse()
        .then((response) => response.json())
        .then(this.handleNewReport)
    }
    this.forceUpdate()
  }

  handleNewReport(data) {
    let report = this.state.report
    let hasNewReport = this.state.hasNewReport
    let disableReview = this.state.disableReview
    if (data.messages) {
      data.messages.forEach((msg) => {
        if (msg.visible) {
          this.addMessage(msg)
        }
        if ('msg.no_report_created' === msg.message) {
          this.addMessage(msg)
          report = null
          // no report, do not do any review actions
          disableReview = true
        }
        if ("msg.sync.course_inactive" === msg.message) {
          // course scan failed, issues may be outdated
          disableReview = true
        }
      });
    }
    if (data.data && data.data.id) {
      report = data.data
      hasNewReport = true
    }
    this.setState({ 
      syncComplete: true, 
      hasNewReport, 
      report,
      disableReview, 
    })
  }

  handleManualScan(issueId) {
    let api = new Api(this.settings)
        api.scanIssue(issueId)
          .then((response) => response.json())
          .then((data) => {
            if (data.messages) {
              data.messages.forEach((msg) => {
                if (msg.visible) {
                  this.addMessage(msg);
                }
              });
            }
            if (data.data && data.data.id) {
              const report = {...this.state.report }
              // doing this to prevent mutating the report in the state
              report.issues = {...report.issues}
              report.issues[data.data.id] = data.data              
              this.setState({ report, hasNewReport: true });
            }
          });
  }

  handleNavigation(navigation) { 
    this.setState({navigation})
  }

  handleModal(modal) {
    this.setState({modal})
  }

  handleAppFilters = (filters) => {
    this.appFilters = filters;
  }

  addMessage = (msg) => {
    this.messages.push(msg)
  }

  clearMessages = () => {
    this.messages = [];
  }

  handleIssueSave(newIssue, newReport) {
    let { report } = this.state
    report = {...report, ...newReport}

    if (report && Array.isArray(report.issues)) {
      report.issues = report.issues.filter(issue => (issue.id != newIssue.id))
      report.issues.push(newIssue)
    }

    this.setState({ report })
  }

  handleFileSave(newFile, newReport) {
    let { report } = this.state
    report = { ...report, ...newReport }

    if (report && report.files) {
      report.files[newFile.id] = newFile
    }

    this.setState({ report })
  }
}

export default App