import React from 'react';
import { Tabs } from '@instructure/ui-tabs'

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
        minHeight="10rem"
        maxHeight="10rem"
        >
        <Tabs.Panel renderTitle="Summary" isSelected={selectedIndex === 0}>
            Summary
        </Tabs.Panel>
        <Tabs.Panel renderTitle="Content" isSelected={selectedIndex === 1}>
            Content
        </Tabs.Panel>
        <Tabs.Panel renderTitle="Files" isSelected={selectedIndex === 2}>
            Files
        </Tabs.Panel>
        </Tabs>
      </div>
    )
  }
}

export default HeaderTabs;