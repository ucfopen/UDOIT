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
    courseId: null
  }

  const [messages, setMessages] = useState(initialData.messages || [])
  const [settings, setSettings] = useState(initialData.settings || null)
  const [courses, setCourses] = useState({})
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [filters, setFilters] = useState({...initialFilters})
  const [searchTerm, setSearchTerm] = useState('')
  const [accountData, setAccountData] = useState([])
  const [navigation, setNavigation] = useState('courses')
  const [modal, setModal] = useState(null)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [trayOpen, setTrayOpen] = useState(false)

  const t = useCallback((key) => {
    return (settings.labels[key]) ? settings.labels[key] : key
  }, [settings.labels])

  const loadCourses = (filters) => {
    setLoadingCourses(true)

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
        setLoadingCourses(false)
      })
  }

  const handleNavigation = (navigation) => {
    setSelectedCourse(null)
    setNavigation(navigation)
  }

  const handleReportClick = (course) => {
    setSelectedCourse(course)
    setNavigation('reports')
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

  return (
    <div id="app-container"
         className={`flex-column flex-grow-1 ${settings?.user?.roles?.font_size || 'font-medium'} ${settings?.user?.roles?.font_family || 'sans-serif'} ${settings?.user?.roles?.dark_mode ? 'dark-mode' : ''}`}>
      <AdminHeader
        t={t}
        settings={settings}
        navigation={navigation}
        handleNavigation={handleNavigation}
      />

      <main role="main" className="pt-2">
        { (navigation !== 'reports') &&
          <AdminFilters
            t={t}
            settings={settings}
            filters={filters}
            handleFilter={handleFilter}
            loadingContent={loadingCourses}
            searchTerm={searchTerm}
            handleSearchTerm={setSearchTerm}
          />
        }

        {loadingCourses &&
          <div className="mt-3 flex-row justify-content-center">
            <div className="flex-column justify-content-center me-3">
              <ProgressIcon className="icon-lg udoit-suggestion spinner" />
            </div>
            <div className="flex-column justify-content-center">
              <h2 className="mt-0 mb-0">{t('report.label.loading')}</h2>
            </div>
          </div>
        }

        { !loadingCourses && (
          <div className="non-scrollable">
            
            {('courses' === navigation) &&
              <CoursesPage
                t={t}
                settings={settings}
                courses={courses}
                searchTerm={searchTerm}
                addMessage={addMessage}
                handleCourseUpdate={handleCourseUpdate}
                handleReportClick={handleReportClick}
                handleNavigation={handleNavigation}
              />
            }
            {('reports' === navigation) &&
              <ReportsPage
                t={t}
                settings={settings}
                filters={filters}
                selectedCourse={selectedCourse}
              />
            }
            {('users' === navigation) &&
              <UsersPage
                t={t}
                settings={settings}
                searchTerm={searchTerm}
                accountId={accountId}
                termId={filters.termId}
              />
            }
          </div>
        )}
        </main>
      <MessageTray
        t={t}
        messages={messages}
        clearMessages={clearMessages}
        hasNewReport={true}
      />
    </div>
  )
}