import React from 'react'
import AdminHeader from './AdminHeader'
import CoursesPage from './CoursesPage'
import ReportsPage from './ReportsPage'
import SettingsPage from './SettingsPage'
import UsersPage from './UsersPage'
import { View } from '@instructure/ui-view'
import Api from '../../Services/Api'
import MessageTray from '../MessageTray'
import AdminTrayForm from '../Admin/AdminTrayForm'
import { Tag } from '@instructure/ui-tag'

import { Text } from '@instructure/ui-text'
import { Spinner } from '@instructure/ui-spinner'

class AdminApp extends React.Component {
  constructor(props) {
    super(props)

    this.settings = props.settings
    this.messages = props.messages

    if(this.settings) {
      if(this.settings.accounts) {
        const accountIds = Object.keys(this.settings.accounts)
        this.settings.accountId = accountIds.shift()
      }
    }

    this.state = {
      courses: {},
      filters: {
        accountId: this.settings.accountId,
        termId: this.settings.defaultTerm,
        includeSubaccounts: true,
      },
      accountData: [],
      navigation: 'courses',
      modal: null,
      loadingCourses: true,
      trayOpen: false,
    }

    this.handleNavigation = this.handleNavigation.bind(this)
    this.clearMessages = this.clearMessages.bind(this)
    this.addMessage = this.addMessage.bind(this)
    this.t = this.t.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
    this.handleCourseUpdate = this.handleCourseUpdate.bind(this)
    this.loadCourses = this.loadCourses.bind(this)
    this.handleTrayToggle = this.handleTrayToggle.bind(this)
    this.renderFilterTags = this.renderFilterTags.bind(this)

    this.loadCourses(this.state.filters)
  }

  render() {
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
            filters={this.state.filters}
            courses={this.state.courses}
            addMessage={this.addMessage}
            handleCourseUpdate={this.handleCourseUpdate}
            handleFilter={this.handleFilter}
            handleTrayToggle={this.handleTrayToggle}
            renderFilterTags={this.renderFilterTags}
          />
        }
        {(!this.state.loadingCourses) && ('reports' === this.state.navigation) &&
          <ReportsPage
            t={this.t}
            settings={this.settings}
            filters={this.state.filters}
            handleFilter={this.handleFilter}
            handleTrayToggle={this.handleTrayToggle}
            renderFilterTags={this.renderFilterTags}
          />
        }
        {(!this.state.loadingCourses) && ('users' === this.state.navigation) &&
          <UsersPage
            t={this.t}
            settings={this.settings}
            accountId={this.state.accountId}
            termId={this.state.termId}
          />
        }
        {('settings' === this.state.navigation) &&
          <SettingsPage t={this.t}
            settings={this.settings}
            handleNavigation={this.handlenavigation} />
        }
        {this.state.trayOpen && <AdminTrayForm
          filters={this.state.filters}
          handleFilter={this.handleFilter}
          settings={this.settings}
          trayOpen={this.state.trayOpen}
          handleTrayToggle={this.handleTrayToggle}
          courses={this.state.courses}
          t={this.t}
        />}
      </View>
    )
  }


  t(key) {
    return (this.settings.labels[key]) ? this.settings.labels[key] : key
  }

  loadCourses(filters, isMounted) {
    const api = new Api(this.settings)

    api.getAdminCourses(filters)
      .then((response) => response.json())
      .then((data) => {
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
    this.messages.push(msg)
  }

  clearMessages = () => {
    this.messages = [];
  }

  handleFilter(newFilter) {
    const filters = Object.assign(this.state.filters, newFilter)
    this.setState({ filters }, () => {
      this.loadCourses(this.state.filters, true)
    })

  }

  handleCourseUpdate(course) {
    let courses = this.state.courses
    courses[course.id] = course
    this.setState({courses})
  }

  handleTrayToggle = (e, val) => {
    this.setState({ trayOpen: !this.state.trayOpen });
  }

  renderFilterTags() {
    let tags = [];

    const accounts = this.settings.accounts
    const terms = this.settings.terms
    const selectedAccountId = this.state.filters.accountId
    const selectedTermId = this.state.filters.termId

    if (accounts && accounts[selectedAccountId]) {
      const id = `accounts||${selectedAccountId}`
      const label = `${this.t('label.admin.account')}: ${accounts[selectedAccountId].name}`
      tags.push({ id: id, label: label })
    }

    if (terms && terms[selectedTermId]) {
      const id = `terms||${selectedTermId}`
      const label = `${this.t('label.admin.term')}: ${terms[selectedTermId]}`
      tags.push({ id: id, label: label })
    }

    return tags.map((tag) => (
      <Tag margin="0 small small 0"
        text={tag.label}
        readOnly={true}
        dismissible={false}
        key={tag.id} />
    ));
  }
}

export default AdminApp
