import React from 'react';
import { View } from '@instructure/ui-view'

class SettingsPage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      reports: []
    }
  }

  componentDidMount() {
    if (this.state.reports.length === 0) {

    }
  }

  render() {
    return (
      <View as="div" padding="small 0">
        Settings coming soon...
      </View>
    )
  }
}

export default SettingsPage