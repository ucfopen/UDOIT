import React from 'react'
import '@instructure/canvas-theme'
import AdminHeader from './AdminHeader'
import CoursesPage from './CoursesPage'
//import ReportsPage from './ReportsPage'
import AccountSelect from './AccountSelect'
import { View } from '@instructure/ui-view'
import Api from '../../Services/Api'
import MessageTray from '../MessageTray'
import FilesPage from '../FilesPage'

import { Text } from '@instructure/ui-text'
import { Spinner } from '@instructure/ui-spinner'

class AdminApp extends React.Component {
  constructor(props) {
    super(props)

    this.settings = {}
    this.messages = []

    this.getSettings()

    this.state = {
      courses: {},
      accountId: this.settings.accountId,
      termId: this.settings.termId,
      accountData: [],
      navigation: 'courses',
      modal: null,
      loadingCourses: true,
    }

    this.handleNavigation = this.handleNavigation.bind(this)
    this.clearMessages = this.clearMessages.bind(this)
    this.addMessage = this.addMessage.bind(this)
    this.t = this.t.bind(this)
    this.handleAccountSelect = this.handleAccountSelect.bind(this)
    this.handleTermSelect = this.handleTermSelect.bind(this)
    this.handleCourseUpdate = this.handleCourseUpdate.bind(this)
    this.loadCourses = this.loadCourses.bind(this)

    this.loadCourses(this.settings.accountId, this.settings.termId)
  }

  render() {
    console.log('state', this.state)

    return (
      <View as="div">
        <AdminHeader
          t={this.t}
          settings={this.settings}
          hasNewReport={this.hasNewReport}
          navigation={this.state.navigation}
          handleNavigation={this.handleNavigation}
          handleModal={this.handleModal} />

        <MessageTray messages={this.messages} t={this.t} clearMessages={this.clearMessages} hasNewReport={true} />

        {('settings' !== this.state.navigation) &&
          <AccountSelect
            settings={this.settings}
            accountId={this.state.accountId}
            termId={this.state.termId}
            t={this.t}
            handleAccountSelect={this.handleAccountSelect}
            handleTermSelect={this.handleTermSelect}
            loadCourses={this.loadCourses}
          />
        }

        {(this.state.loadingCourses) &&
          <View as="div" padding="small 0">
            <View as="div" textAlign="center" padding="medium">
              <Spinner variant="inverse" renderTitle={this.t('label.loading')} />
              <Text as="p" weight="light" size="large">{this.t('label.loading')}</Text>
            </View>
          </View>
        }

        {(!this.state.loadingCourses) && ('courses' === this.state.navigation) &&
          <CoursesPage
            settings={this.settings}
            t={this.t}
            accountId={this.state.accountId}
            courses={this.state.courses}
            termId={this.state.termId}
            addMessage={this.addMessage}
            handleCourseUpdate={this.handleCourseUpdate}
            key="adminCoursePage"></CoursesPage>
        }
        {/* {('reports' === this.state.navigation) &&
                    <ReportsPage
                        t={this.t}
                        settings={this.settings}
                        handleNavigation={this.handleNavigation}
                    />
                }
                {('settings' === this.state.modal) &&
                    <SettingsPage t={this.t}
                        settings={this.settings}
                        handleNavigation={this.handlenavigation} />
                } */}
      </View>
    )
  }


  t(key) {
    return (this.settings.labels[key]) ? this.settings.labels[key] : key
  }

  getSettings() {
    const settingsElement = document.querySelector(
      'body > script#toolSettings[type="application/json"]'
    )

    if (settingsElement !== null) {
      let data = JSON.parse(settingsElement.textContent)

      if (data) {
        console.log('settings', data.settings)
        console.log('messages', data.messages)

        this.messages = data.messages
        this.settings = data.settings

        this.settings.accountId = this.settings.account.id

        const termIds = Object.keys(this.settings.terms)
        termIds.sort()
        this.settings.termId = termIds.shift()
      }
    }
    else {
      this.addMessage({ message: 'Settings failed to load.', severity: 'warning', timeout: 5000 })
    }
  }

  loadCourses(accountId, termId, isMounted) {
    const api = new Api(this.settings)
    api.getAdminCourses(accountId, termId)
      .then((response) => response.json())
      .then((data) => {
        console.log('data', data)

        let courses = {}
        if (Array.isArray(data.data)) {
          data.data.forEach(course => {
            courses[course.id] = course
          })
          this.setState({courses})
        }
        
        this.setState({loadingCourses: false})
      })

    if (isMounted) {
      this.setState({loadingCourses: true})
    }
  }

  handleNavigation(navigation) {
    this.setState({ navigation })
  }

  addMessage = (msg) => {
    console.log('msg', msg)
    this.messages.push(msg)
  }

  clearMessages = () => {
    this.messages = [];
  }
  
  handleAccountSelect(accountId) {
    this.setState({accountId})
  }

  handleTermSelect(termId) {
    this.setState({termId})
  }

  handleCourseUpdate(course) {
    let courses = this.state.courses
    courses[course.id] = course
    this.setState({courses})
  }

}

export default AdminApp