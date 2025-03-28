import React, { useState, useEffect, useCallback } from 'react'
import AdminHeader from './AdminHeader'
import CoursesPage from './CoursesPage'
import ReportsPage from './ReportsPage'
import UsersPage from './UsersPage'
import Api from '../../Services/Api'
import MessageTray from '../MessageTray'
import AdminFilters from '../Admin/AdminFilters'
import ProgressIcon from '../Icons/ProgressIcon'

import '../../../css/udoit4-theme.css'

export default function AdminApp(initialData) {

  // If there are multiple accounts available, the first account is the selected accountId
  let accountId = initialData.settings?.accountId
  if(initialData.settings?.accounts) {
    const accountIds = Object.keys(initialData.settings.accounts)
    accountId = accountIds.shift()
  }

  let initialFilters = {
    accountId: accountId,
    termId: initialData.settings.defaultTerm,
    includeSubaccounts: true,
  }

  const [messages, setMessages] = useState(initialData.messages || [])
  const [settings, setSettings] = useState(initialData.settings || null)
  const [courses, setCourses] = useState({})
  const [filters, setFilters] = useState({...initialFilters})
  const [searchTerm, setSearchTerm] = useState('')
  const [accountData, setAccountData] = useState([])
  const [navigation, setNavigation] = useState('courses')
  const [modal, setModal] = useState(null)
  const [loadingContent, setLoadingContent] = useState(true)
  const [trayOpen, setTrayOpen] = useState(false)

  const t = useCallback((key) => {
    return (settings.labels[key]) ? settings.labels[key] : key
  }, [settings.labels])

  const loadCourses = (filters) => {
    setLoadingContent(true)

    const api = new Api(settings)
    api.getAdminCourses(filters)
      .then((response) => response.json())
      .then((data) => {
        let courses = {}
        if (Array.isArray(data.data)) {
          data.data.forEach(course => {
            courses[course.id] = course
          })
          setCourses(courses)
        }
        setLoadingContent(false)
      })
  }

  const handleNavigation = (navigation) => {
    setNavigation(navigation)
  }

  const addMessage = (msg) => {
    setMessages(prevMessages => [...prevMessages, msg])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const handleFilter = (newFilter) => {
    const tempFilters = Object.assign({}, filters, newFilter)
    setFilters(tempFilters)
  }

  useEffect(() => {
    loadCourses(initialFilters)
  }, [])

  useEffect(() => {
    loadCourses(filters, true)
  }, [filters])

  const handleCourseUpdate = (courseData) => {
    let tempCourses = Object.assign({}, courses)
    tempCourses[courseData.id] = courseData
    setCourses(tempCourses)
  }

  const handleTrayToggle = () => {
    setTrayOpen(!trayOpen)
  }

  const renderFilterTags = () => {
    const accounts = settings.accounts
    const selectedAccountId = filters.accountId
    const terms = settings.terms
    const selectedTermId = filters.termId

    return (
      <div className="flex-row gap-3 mt-2">
        { accounts && accounts[selectedAccountId] &&
          <div>{`${t('label.admin.account')}: ${accounts[selectedAccountId].name}`}</div>
        }
        { terms && terms[selectedTermId] &&
          <div>{`${t('label.admin.term')}: ${terms[selectedTermId]}`}</div>
        }
      </div>
    )
  }

  return (
    <div>
      <AdminHeader
        t={t}
        settings={settings}
        navigation={navigation}
        handleNavigation={handleNavigation}
      />

      <AdminFilters
        t={t}
        settings={settings}
        filters={filters}
        handleFilter={handleFilter}
        loadingContent={loadingContent}
        searchTerm={searchTerm}
        handleSearchTerm={setSearchTerm}
      />

      <MessageTray
        t={t}
        messages={messages}
        clearMessages={clearMessages}
        hasNewReport={true}
      />

      {loadingContent &&
        <div className="mt-3 flex-row justify-content-center">
          <div className="flex-column justify-content-center me-3">
            <ProgressIcon className="icon-lg primary-dark spinner" />
          </div>
          <div className="flex-column justify-content-center">
            <h1 className="mt-0 mb-0">{t('label.loading')}</h1>
          </div>
        </div>
      }

      { !loadingContent && (
        <>
          
          {('courses' === navigation) &&
            <CoursesPage
              t={t}
              settings={settings}
              courses={courses}
              searchTerm={searchTerm}
              addMessage={addMessage}
              handleCourseUpdate={handleCourseUpdate}
            />
          }
          {('reports' === navigation) &&
            <ReportsPage
              t={t}
              settings={settings}
              filters={filters}
              handleFilter={handleFilter}
              handleTrayToggle={handleTrayToggle}
              renderFilterTags={renderFilterTags}
            />
          }
          {('users' === navigation) &&
            <UsersPage
              t={t}
              settings={settings}
              accountId={accountId}
              termId={filters.termId}
            />
          }
        </>
      )}
    </div>
  )
}