import React, { useState, useEffect, useCallback } from 'react'
import AdminHeader from './AdminHeader'
import AdminDashboard from './AdminDashboard'
import CoursesPage from './CoursesPage'
import ReportsPage from './ReportsPage'
import UsersPage from './UsersPage'
import Api from '../../Services/Api'
import MessageTray from '../Widgets/MessageTray'
import AdminFilters from '../Admin/AdminFilters'
import ProgressIcon from '../Icons/ProgressIcon'

import '../../../css/udoit4-theme.css'

export default function AdminApp(initialData) {

  // If there are multiple accounts available, the first account is the selected accountId
  let accountId = initialData.accountId
  if(initialData.accounts) {
    const accountIds = Object.keys(initialData.accounts)
    accountId = accountIds.shift()
  }

  let initialFilters = {
    accountId: accountId,
    termId: initialData.termInfo.defaultTerm,
    includeSubaccounts: true,
    courseId: null
  }

  const [messages, setMessages] = useState(initialData.messages || [])
  const [preferences, setPreferences] = useState(initialData.preferences ?? {})
  const [instanceInfo, setInstanceInfo] = useState(initialData.instanceInfo ?? {})
  const [termInfo, setTermInfo] = useState(initialData.termInfo || {})
  const [labels, setLabels] = useState(initialData.labels ?? [])
  const [accounts, setAccounts] = useState(initialData.accounts)

  const [courses, setCourses] = useState({})
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [filters, setFilters] = useState({...initialFilters})
  const [searchTerm, setSearchTerm] = useState('')
  const [accountData, setAccountData] = useState([])
  const [navigation, setNavigation] = useState('dashboard')
  const [modal, setModal] = useState(null)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [trayOpen, setTrayOpen] = useState(false)

  const t = useCallback((key) => {
    return (labels[key]) ? labels[key] : key
  }, [labels])

  const loadCourses = (filters) => {
    setLoadingCourses(true)

    const api = new Api(instanceInfo)
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
    let tempCourses = {...courses}
    
    // If there's an oldId, this is a newly scanned course that needs the old entry removed
    if (courseData.oldId && courseData.oldId !== courseData.id) {
      // Remove the old unscanned course entry
      if (tempCourses[courseData.oldId]) {
        delete tempCourses[courseData.oldId]
      }
      
      // Add the new scanned course entry
      const updatedCourse = {...courseData}
      delete updatedCourse.oldId  // Remove the signal flag
      tempCourses[courseData.id] = updatedCourse
    }
    // If updating an existing course, just update its data
    else if (tempCourses[courseData.id]) {
      tempCourses[courseData.id] = {...tempCourses[courseData.id], ...courseData}
    } 
    // If it's a new course, add it
    else {
      tempCourses[courseData.id] = courseData
    }
    
    setCourses(tempCourses)
  }

  return (
    <div id="app-container"
         className={`flex-column flex-grow-1 ${preferences.fontSize || 'font-medium'} ${preferences.fontSize || 'sans-serif'} ${preferences.darkMode ? 'dark-mode' : ''}`}>
      <AdminHeader
        t={t}
        navigation={navigation}
        handleNavigation={handleNavigation}
      />

      <main role="main" className="pt-2">
        { (navigation !== 'reports' && navigation !== 'dashboard') &&
          <AdminFilters
            t={t}
            preferences={preferences}
            accounts={accounts}
            termInfo={termInfo}
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
              <ProgressIcon className="icon-lg udoit-progress spinner" />
            </div>
            <div className="flex-column justify-content-center">
              <h2 className="mt-0 mb-0">{t('report.label.loading')}</h2>
            </div>
          </div>
        }

        { !loadingCourses && (
          <div className="scrollable">
            
            {('dashboard' === navigation) &&
              <AdminDashboard
                t={t}
                preferences={preferences}
                courses={courses}
                handleNavigation={handleNavigation}
                addMessage={addMessage}
              />
            }
            {('courses' === navigation) &&
              <CoursesPage
                t={t}
                courses={courses}
                instanceInfo={instanceInfo}
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
                instanceInfo={instanceInfo}
                filters={filters}
                selectedCourse={selectedCourse}
              />
            }
            {('users' === navigation) &&
              <UsersPage
                t={t}
                instanceInfo={instanceInfo}
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