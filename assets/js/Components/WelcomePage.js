import React from 'react';
import { View } from '@instructure/ui-view'
import { Button } from '@instructure/ui-buttons'
import { Heading } from '@instructure/ui-heading'
import { Checkbox } from '@instructure/ui-checkbox'
import AboutPage from './AboutPage'
import Api from '../Services/Api'

class WelcomePage extends React.Component {
  constructor(props) {
    super(props)

    this.handleSkipWelcomeMessage = this.handleSkipWelcomeMessage.bind(this)
  }

  render() {
    return (
      <View as="div">
        <View as="div" borderWidth="0 0 small 0" margin="small x-large" padding="medium x-large">
          <Heading level="h2">{this.props.t('about.title')}</Heading>
          <AboutPage t={this.props.t} settings={this.props.settings} />
        </View>
        <View as="div" margin="0 x-large">
          <Checkbox label={this.props.t('about.skip_welcome')} value="skip" 
            onClick={this.handleSkipWelcomeMessage} />
        </View>
        <View as="div" textAlign="center" padding="medium">          
          <Button onClick={() => this.props.handleNavigation('summary')} color="primary"
            interaction={this.props.hasNewReport ? 'enabled' : 'disabled'}>
            {this.props.t('label.continue')}</Button>
        </View>
      </View>
    )
  }

  handleSkipWelcomeMessage(event) {
    let api = new Api(this.props.settings)
    let user = this.props.settings.user

    if (event.target.checked) {
      user.roles = ['ROLE_ADVANCED_USER']
    } 
    else {
      user.roles = []
    }

    api.updateUser(user)    
      .then((response) => response.json())
      .then((data) => {
        console.log('user', data)
      })

  }
}

export default WelcomePage;