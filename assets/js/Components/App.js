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

    this.hasNewReport = false
    this.initialReport = props.report
    this.appFilters = {}
    this.settings = props.settings
    this.reportHistory = []
    this.messages = props.messages
    this.newReportInterval = 5000

    this.state = {
      report: this.initialReport,
      navigation: 'welcome',
      modal: null
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
  }

  render() {    
    return (
      <View as="div">
        <Header
          t={this.t}
          settings={this.settings}
          hasNewReport={this.hasNewReport}
          navigation={this.state.navigation}
          handleNavigation={this.handleNavigation} 
          handleCourseRescan={this.handleCourseRescan}
          handleModal={this.handleModal} />

        <MessageTray messages={this.messages} t={this.t} clearMessages={this.clearMessages} hasNewReport={this.hasNewReport} />

        {('welcome' === this.state.navigation) && 
          <WelcomePage 
            handleNavigation={this.handleNavigation} 
            t={this.t}
            hasNewReport={this.hasNewReport} />
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
      .then((response) => {
        this.checkForNewReport()
      })
  }

  t(key) {
    return (this.settings.labels[key]) ? this.settings.labels[key] : key
  }

  scanCourse() {
    let api = new Api(this.settings)
    
    return api.scanCourse(this.settings.course.id)
  }

  handleCourseRescan() {
    if (this.hasNewReport) {
      this.hasNewReport = false
      this.scanCourse()
        .then((response) => {
          this.checkForNewReport()
        })
    }
    this.forceUpdate()
  }

  checkForNewReport() {
    if (!this.hasNewReport) {
      var intervalId = setInterval(() => {
        let api = new Api(this.settings)
        api.getReport()
          .then((response) => response.json())
          .then((data) => {
            if (data.messages) {
              data.messages.forEach((msg) => {
                if (msg.visible) {
                  this.addMessage(msg)
                }
                if ('msg.no_report_created' === msg.message) {
                  this.addMessage(msg)
                  clearInterval(intervalId)
                  this.setState({ report: null })
                }
              });
            }
            if (data.data && data.data.id) {
              this.hasNewReport = true;
              clearInterval(intervalId);
              this.setState({ report: data.data });
            }
          });
      }, this.newReportInterval);
    }
    else {
      clearInterval(intervalId);
    }
  }

  handleManualScan() {
    let api = new Api(this.settings)
        api.getReport()
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
              this.hasNewReport = true;
              this.setState({ report: data.data });
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

    if (report && Array.isArray(report.files)) {
      report.files = report.files.filter(file => (file.id != newFile.id))
      report.files.push(newFile)
    }

    this.setState({ report })
  }
}

export default App