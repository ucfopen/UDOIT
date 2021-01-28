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
    this.initialReport = null
    this.appFilters = {}
    this.settings = {}
    this.reportHistory = []
    this.messages = []
    this.newReportInterval = 5000

    this.getSettings();

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
  }

  render() {    
    console.log('render', this.state)

    return (
      <View as="div">
        <Header
          t={this.t}
          settings={this.settings}
          hasNewReport={this.hasNewReport}
          navigation={this.state.navigation}
          handleNavigation={this.handleNavigation} 
          handleModal={this.handleModal} />

        <MessageTray messages={this.messages} t={this.t} clearMessages={this.clearMessages} hasNewReport={this.hasNewReport} />

        {('welcome' === this.state.navigation) && 
          <WelcomePage 
            key="welcomePage" 
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
            t={this.t}
            key="summaryPage"></SummaryPage>
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
            t={this.t}
            key="contentPage"></ContentPage>
        }
        {('files' === this.state.navigation) &&
          <FilesPage
            report={this.state.report}
            settings={this.settings}
            handleNavigation={this.handleNavigation}
            handleFileSave={this.handleFileSave}
            t={this.t}
            key="filesPage"></FilesPage>
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
    
    return api.scanCourse()
  }

  checkForNewReport() {
    if (!this.hasNewReport) {
      var intervalId = setInterval(() => {
        let api = new Api(this.settings)
        api.getReport()
          .then((response) => response.json())
          .then((data) => {
            console.log('data', data)
            if (data.messages) {
              data.messages.forEach((msg) => {
                console.log('message', msg);
                if (msg.visible) {
                  this.addMessage(msg);
                }
              });
            }
            if (data.data && data.data.id) {
              this.hasNewReport = true;
              clearInterval(intervalId);
              console.log('report', data.data);
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
            console.log('data', data)
            if (data.messages) {
              data.messages.forEach((msg) => {
                console.log('message', msg);
                if (msg.visible) {
                  this.addMessage(msg);
                }
              });
            }
            if (data.data && data.data.id) {
              this.hasNewReport = true;
              console.log('report', data.data);
              this.setState({ report: data.data });
            }
          });
  }

  getSettings() {
    const settingsElement = document.querySelector(
      'body > script#toolSettings[type="application/json"]'
    )

    if (settingsElement !== null) {
      let data = JSON.parse(settingsElement.textContent)
      
      if (data) {
        this.messages = data.messages
        this.settings = data.settings
        console.log('settings', data.settings)
        console.log('messages', data.messages)
        
        if (data.report) {
          this.initialReport = data.report
          console.log('init report', data.report)
        }
      }
    }
    else {
      this.addMessage({message: 'Settings failed to load.', severity: 'warning', timeout: 5000})
    }
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
    console.log('msg', msg)
    this.messages.push(msg)
  }

  clearMessages = () => {
    this.messages = [];
  }

  handleIssueSave(newIssue, newReport) {
    let { report } = this.state
    report = {...report, ...newReport}

    if (report && report.issues && report.issues[newIssue.id]) {
      report.issues[newIssue.id] = newIssue
    }

    this.setState({ report })
  }

  handleFileSave(newFile, newReport) {
    let { report } = this.state
    report = { ...report, ...newReport }

    if (report && report.files && report.files[newFile.id]) {
      report.files[newFile.id] = newFile
    }

    this.setState({ report })
  }
}

export default App