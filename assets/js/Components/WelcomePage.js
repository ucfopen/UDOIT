import React from 'react';
import { View } from '@instructure/ui-view'
import { Button } from '@instructure/ui-buttons'
import { Heading } from '@instructure/ui-heading'
import { Checkbox } from '@instructure/ui-checkbox'
import AboutPage from './AboutPage'
import Api from '../Services/Api'

export default function WelcomePage({ t, settings, setSettings, hasNewReport, handleNavigation }) {

  const handleSkipWelcomeMessage = (event) => {
    let api = new Api(settings)
    let user = settings.user

    if (event.target.checked) {
      user.roles = ['ROLE_ADVANCED_USER']
    } 
    else {
      user.roles = []
    }

    api.updateUser(user)    
      .then((response) => response.json())
      .then((data) => {
        let newSettings = [...settings]
        newSettings.user = data
        setSettings(newSettings)
      })
  }

  return (
    <View as="div">
      <View as="div" borderWidth="0 0 small 0" margin="small x-large" padding="medium x-large">
        <Heading level="h2">{t('about.title')}</Heading>
        <AboutPage t={t} settings={settings} />
      </View>
      <View as="div" margin="0 x-large">
        <Checkbox label={t('about.skip_welcome')} value="skip" 
          onClick={handleSkipWelcomeMessage} />
      </View>
      <View as="div" textAlign="center" padding="medium">          
        <Button onClick={() => handleNavigation('summary')} color="primary"
          interaction={hasNewReport ? 'enabled' : 'disabled'}>
          {t('label.continue')}</Button>
      </View>
    </View>
  )
}