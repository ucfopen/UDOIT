import React from 'react';
import { Tabs } from '@instructure/ui-tabs'
import SummaryPage from './SummaryPage'
import ContentPage from './ContentPage';
import Report from './Report';

class HeaderTabs extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        selectedIndex: 0
    }

    this.handleTabChange = this.handleTabChange.bind(this)
  }

  handleTabChange = (event, { index, id }) => {
    this.setState({
      selectedIndex: index
    })
  }

  render() {
    const { selectedIndex } = this.state
    return (
      <div>
        <Tabs
        variant="secondary"
        onRequestTabChange={this.handleTabChange}
        minHeight="10vh"
        maxHeight="100vh"
        >
        <Tabs.Panel renderTitle="Summary" isSelected={selectedIndex === 0}>
            <SummaryPage/>
        </Tabs.Panel>
        <Tabs.Panel renderTitle="Content" isSelected={selectedIndex === 1}>
          <ContentPage></ContentPage>
        </Tabs.Panel>
        <Tabs.Panel renderTitle="Files" isSelected={selectedIndex === 2}>
            <Report/>
        </Tabs.Panel>
        </Tabs>
      </div>
    )
  }
}

export default HeaderTabs;