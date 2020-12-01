import React from 'react'
import WelcomePage from './WelcomePage'
import Header from './Header'
import { Tabs } from '@instructure/ui-tabs'
import SummaryPage from './SummaryPage'
import ContentPage from './ContentPage';
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import Api from '../Services/Api';
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
      navigation: {
        tabIndex: 0,
        showSettings: false,
        showAbout: false,
        showWelcome: true,
      }
    }

    this.handleNavigation = this.handleNavigation.bind(this)
    this.handleAppFilters = this.handleAppFilters.bind(this)
    this.clearMessages = this.clearMessages.bind(this)
    this.addMessage = this.addMessage.bind(this)
    this.hideWelcome = this.hideWelcome.bind(this)
    this.t = this.t.bind(this)
    this.handleIssueSave = this.handleIssueSave.bind(this)
  }

  render() {    
    const tabIndex = this.state.navigation.tabIndex
    console.log('render', this.state)

    if (this.state.navigation.showWelcome) {
      return (
        <View as="div">
          <Header />
          <MessageTray messages={this.messages} t={this.t} clearMessages={this.clearMessages} hasNewReport={this.hasNewReport} />
          <WelcomePage key="welcomePage" handleContinueBtn={this.hideWelcome} t={this.t} 
            hasNewReport={this.hasNewReport} />
        </View>
      );
    }
    else {
      return (
        <View as="div">
          <Header />
          <MessageTray messages={this.messages} t={this.t} clearMessages={this.clearMessages} hasNewReport={this.hasNewReport} />          
          <Tabs
            onRequestTabChange={this.handleTabChange}
            key="mainTabs"
          >
            <Tabs.Panel renderTitle={this.t('label.summary')} isSelected={tabIndex === 0} key="summaryTab">
              <SummaryPage 
                report={this.state.report} 
                settings={this.settings} 
                navigation={this.state.navigation}
                handleAppFilters={this.handleAppFilters}
                handleNavigation={this.handleNavigation} 
                t={this.t}
                key="summaryPage"></SummaryPage>
            </Tabs.Panel>
            <Tabs.Panel renderTitle={this.t('label.content')} isSelected={tabIndex === 1} key="contentTab">
              <ContentPage 
                report={this.state.report} 
                settings={this.settings} 
                appFilters={this.appFilters} 
                navigation={this.state.navigation}
                handleAppFilters={this.handleAppFilters} 
                handleNavigation={this.handleNavigation}
                handleIssueSave={this.handleIssueSave}
                handleIssueUpdate={this.handleIssueUpdate}
                t={this.t}
                key="contentPage"></ContentPage>
            </Tabs.Panel>
            <Tabs.Panel renderTitle={this.t('label.plural.file')} isSelected={tabIndex === 2} key="filesTab">
              <FilesPage
                report={this.state.report}
                settings={this.settings}
                navigation={this.state.navigation}
                handleNavigation={this.handleNavigation}
                t={this.t}
                key="filesPage"></FilesPage>
            </Tabs.Panel>
          </Tabs>
        </View>
      )
    }
  }

  componentDidMount() {
    if (this.initialReport) {
      this.setState({report: this.initialReport})

      if (this.state.navigation.showWelcome) {
        this.hideWelcome()
      }
    }
    this.checkForNewReport()
  }

  componentDidUpdate() {}

  t(key) {
    return (this.settings.labels[key]) ? this.settings.labels[key] : key
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

  getSettings() {
    const settingsElement = document.querySelector(
      'body > script#toolSettings[type="application/json"]'
    )

    if (settingsElement !== null) {
      let data = JSON.parse(settingsElement.textContent)
      
      if (data) {
        this.messages = data.messages
        this.settings = data.settings
        
        if (data.report) {
          this.initialReport = data.report
          console.log('init report', data.report)
        }
      }
    }
    else {
      // show error message
    }
  }

  handleTabChange = (event, {index, id}) => {
    this.setState(prevState => ({
      navigation: {
        ...prevState.navigation,
        tabIndex: index
      }
    }));
  };

  handleNavigation = (nav) => { 
    this.setState({navigation: nav});
  }

  handleAppFilters = (filters) => {
    this.appFilters = filters;
  }

  addMessage = (msg) => {
    this.messages.push(msg);
  }

  clearMessages = () => {
    this.messages = [];
  }

  hideWelcome() {
    this.setState(prevState => ({
      navigation: {
        ...prevState.navigation,
        showWelcome: false
      }
    }))
  }

  handleIssueSave(newIssue, newReport) {
    let { report } = this.state
    report = {...report, ...newReport}

    if (report && report.issues && report.issues[newIssue.id]) {
      report.issues[newIssue.id] = newIssue
    }

    this.setState({ report })
  }
}

export default App;