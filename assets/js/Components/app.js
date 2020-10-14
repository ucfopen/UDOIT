import React from 'react'
import WelcomePage from './WelcomePage'
import Header from './Header'
import { Tabs } from '@instructure/ui-tabs'
import SummaryPage from './SummaryPage'
import ContentPage from './ContentPage';
import classes from '../../css/app.scss'
import { Button } from '@instructure/ui-buttons'
import data from'../report_example.json';


import '@instructure/canvas-theme';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      "hasReport": false,
      "report": {},
      "filters": { 
        sections: "SHOW_ALL",
        content: "SHOW_ALL",
        issueTypes: "SHOW_ALL",
        issueTitles: "SHOW_ALL",
        status: "SHOW_ALL",
        search_term: "SHOW_ALL"
      },
      "settings": {},
      "navigation": {
        "tabIndex": 0,
        "showSettings": true,
        "showAbout": ''
      },
      "reportHistory": [],
      "messages": []
    }

    this.handleClick = this.handleClick.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this)
    this.handleFilters = this.handleFilters.bind(this)
  }

  componentDidMount() {
    this.getScanResults();
  }

  render() {
    this.loadSettings();
    
    return (
      <div className={`${classes.app}`}>
        <Header/>
        <Display hasReport={this.state.hasReport} action={this.handleClick} tabIndex={this.state.navigation.tabIndex} 
        handleTabChange={this.handleTabChange} report={this.state.report} settings={this.state.settings} filters={this.state.filters}
        handleFilters={this.handleFilters}/>
      </div>
    )
  }

  loadSettings() {
    const settingsElement = document.querySelector(
      'body > script#toolSettings[type="application/json"]'
    );

    window.toolSettings = {};

    if (settingsElement !== null) {
      window.toolSettings = JSON.parse(settingsElement.textContent);
    }
  }

  getScanResults = () => {
    this.setState({ report: data }, () => {
      console.log(this.state);
    }); 
  }

  handleClick() {
    this.setState(state => ({
      hasReport: !state.hasReport
    }));
  }

  handleTabChange = (event, { index, id }) => { 
    this.setState(prevState => ({
      navigation: {                   // object that we want to update
          ...prevState.navigation,    // keep all other key-value pairs
          tabIndex: index       // update the value of specific key
      }
    }));
  }

  handleFilters = (newFilter) => {
    this.setState({
      filters: newFilter
    })
  }
}

const Display = (props) => {
  const hasReport = props.hasReport;
  const tabIndex = props.tabIndex;

  if(hasReport) {
    return (
      <div>
        <Tabs
        variant="secondary"
        onRequestTabChange={props.handleTabChange}
        minHeight="10vh"
        maxHeight="100vh"
        >
        <Tabs.Panel renderTitle="Summary" isSelected={tabIndex === 0}>
            <SummaryPage report={props.report} settings={props.settings} handleNavigation={props.handleTabChange}></SummaryPage>
        </Tabs.Panel>
        <Tabs.Panel renderTitle="Content" isSelected={tabIndex === 1}>
          <ContentPage report={props.report} settings={props.settings} filters={props.filters} handleFilters={props.handleFilters}></ContentPage>
        </Tabs.Panel>
        <Tabs.Panel renderTitle="Files" isSelected={tabIndex === 2}>
          {/* <Files/> */}
        </Tabs.Panel>
        </Tabs>
      </div>
    )
  } else {
    return <div>
      <WelcomePage/>
      <div className={`${classes.buttonContainer}`}>
          <Button onClick={props.action} color="primary" margin="small" textAlign="center">Scan Course</Button>
      </div>
    </div>;
  }
}

export default App;