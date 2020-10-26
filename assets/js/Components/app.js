import React from 'react'
import WelcomePage from './WelcomePage'
import Header from './Header'
import { Tabs } from '@instructure/ui-tabs'
import SummaryPage from './SummaryPage'
import ContentPage from './ContentPage';
import Classes from '../../css/app.scss'
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import Api from '../Services/Api';
import MessageTray from './MessageTray'

class App extends React.Component {
  constructor(props) {
    super(props);

    this.hasNewReport = false;
    this.appFilters = {};
    this.settings = {};
    this.reportHistory = [];
    this.messages = [];

    this.state = {
      report: null,
      navigation: {
        tabIndex: 0,
        showSettings: false,
        showAbout: false
      }
    }

    this.handleNavigation = this.handleNavigation.bind(this);
    this.handleAppFilters = this.handleAppFilters.bind(this);
    this.clearMessages = this.clearMessages.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.t = this.t.bind(this);
  }

  render() {    
    const tabIndex = this.state.navigation.tabIndex;

    if (this.state.report) {
      return (
        <View as="div">
          <Header />
          <MessageTray messages={this.messages} t={this.t} clearMessages={this.clearMessages} />          
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
                t={this.t}
                key="contentPage"></ContentPage>
            </Tabs.Panel>
            <Tabs.Panel renderTitle={this.t('label.plural.file')} isSelected={tabIndex === 2} key="filesTab">
              FILES
              {/* <Files/> */}
            </Tabs.Panel>
          </Tabs>
        </View>
      );
    }
    else {
      return (
        <div>
          <Header key="welcomeHeader" />
          <WelcomePage key="welcomePage" />
          <div className={Classes.buttonContainer}>
            <Button onClick={this.closeAboutScreen} color="primary" margin="small" textAlign="center">Continue</Button>
          </div>
       </div>
      );
    }
  }

  componentDidMount() {
    if (Object.keys(this.settings).length === 0) {
      this.getSettings();
    }

    this.checkForReport();
  }

  componentDidUpdate() {}

  t(key) {
    return (this.settings.labels[key]) ? this.settings.labels[key] : key;
  }

  closeAboutScreen(e) {
    console.log('e', e);
  }

  checkForReport() {
    if (!this.hasNewReport) {
      var intervalId = setInterval(() => {
        let api = new Api(this.settings);
        api.getReport()
          .then((response) => response.json())
          .then((data) => {
            if (data.messages) {
              data.messages.forEach((msg) => {
                if (msg.visible) {
                  this.addMessage(msg);
                }
                else {
                  console.log('message', msg);
                }
              });
            }
            if (data.data && data.data.id) {
              this.hasNewReport = true;
              clearInterval(intervalId);
              this.setState({ report: data.data });
            }
          });
      }, 2000);
    }
    else {
      clearInterval(intervalId);
    }
  }

  getSettings() {
    const settingsElement = document.querySelector(
      'body > script#toolSettings[type="application/json"]'
    );

    if (settingsElement !== null) {
      let data = JSON.parse(settingsElement.textContent);
      
      if (data) {
        this.messages = data.messages;
        this.reportHistory = data.reports;
        this.settings = data.settings;
        this.setState({report: data.report});
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
}

export default App;