import React from 'react';
import { View } from '@instructure/ui-view'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import AboutPage from './AboutPage'

class WelcomePage extends React.Component {
  render() {
    return (
      <View as="div">
        <AboutPage t={this.props.t} />
        <View as="div" textAlign="center" padding="medium">
          <Button onClick={this.props.handleContinueBtn} color="primary"
            interaction={this.props.hasNewReport ? 'enabled' : 'disabled'}>
            {this.props.t('label.continue')}</Button>
        </View>
      </View>
    )
  }
}

export default WelcomePage;