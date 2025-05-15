import React, { useState, useCallback, useEffect } from 'react'
import Header from './Header'
import WelcomePage from './WelcomePage'
import HomePage from './HomePage'
import FixIssuesPage from './FixIssuesPage'
import ReportsPage from './ReportsPage'
import SettingsPage from './SettingsPage'
import Api from '../Services/Api'
import MessageTray from './MessageTray'


export default function App(initialData) {

  // The initialData object that is passed to the App will generally contain:
  // { 
  //   messages: [],
  //   report: { ... The report from the most recent scan ... },
  //   settings: { ... From src/Controller/DashboardController.php => getSettings() ... },
  //   settings.user: {
  //     "id": 3,
  //     "username": "https://canvas.instructure.com||1129",
  //     "name": null,
  //     "lmsUserId": "1129",
  //      "roles": [
  //         "ROLE_USER"    // or "ROLE_ADVANCED_USER" if they've clicked to skip the welcome page.
  //     ],
  //     "lastLogin": "2025-02-03",
  //     "created": "2025-01-13",
  //     "hasApiKey": true
  //   }
  // }

  const [messages, setMessages] = useState(initialData.messages || [])
  const [report, setReport] = useState(initialData.report || null)  
  const [settings, setSettings] = useState(initialData.settings || null)
  const [sections, setSections] = useState([])

  const [navigation, setNavigation] = useState('summary')
  const [modal, setModal] = useState(null)
  const [syncComplete, setSyncComplete] = useState(false)
  const [hasNewReport, setHasNewReport] = useState(false)
  const [disableReview, setDisableReview] = useState(false)
  const [initialSeverity, setInitialSeverity] = useState('')
  const [initialSearchTerm, setInitialSearchTerm] = useState('')
  const [contentItemCache, setContentItemCache] = useState([])
  const [sessionIssues, setSessionIssues] = useState([])
  const [welcomeClosed, setWelcomeClosed] = useState(false)

  const ISSUE_STATE = {
    UNCHANGED: 0,
    SAVING: 1,
    RESOLVING: 2,
    SAVED: 3,
    RESOLVED: 4,
    ERROR: 5,
  }

  // `t` is used for text/translation. It will return the translated string if it exists
  // in the settings.labels object.
  const t = useCallback((key, values = {}) => {
    let translatedText = (settings.labels[key] && settings.labels[key] !== '') ? settings.labels[key] : key
    if (values && Object.keys(values).length > 0) {
      Object.keys(values).forEach((key) => {
        translatedText = translatedText.replace(`{${key}}`, values[key])
      })
    }
    return translatedText

  }, [settings])

  const scanCourse = useCallback(() => {
    let api = new Api(settings)
    return api.scanCourse(settings.course.id)
  }, [])

  const fullRescan = useCallback(() => {
    let api = new Api(settings)
    return api.fullRescan(settings.course.id)
  }, [])

  const updateUserSettings = (newUserSetting) => {
    let newRoles = Object.assign({}, settings.user.roles, newUserSetting)
    let newUser = Object.assign({}, settings.user, { 'roles': newRoles})
    let newSettings = Object.assign({}, settings, { user: newUser })

    let api = new Api(settings)
    api.updateUser(newUser)
      .then((response) => response.json())
      .then((data) => {
        if(data.user) {
          newSettings.user = data.user
          if(data?.labels?.lang) {
            newSettings.labels = data.labels
          }
          setSettings(newSettings)
        }
    })
  }

  // Session Issues are used to track progress when multiple things are going on at once,
  // and can allow the activeIssue to change without losing information about the previous issue.
  // Each issue has an id and state: { id: issueId, state: 2 }
  // The valid states are set and read in the FixIssuesPage component.
  const updateSessionIssue = (issueId, issueState = null, contentItemId = null) => {
    if(issueState === null || issueState === ISSUE_STATE.UNCHANGED) {
      let newSessionIssues = Object.assign({}, sessionIssues)
      if(newSessionIssues[issueId]) {
        delete newSessionIssues[issueId]
      }
      setSessionIssues(newSessionIssues)

      if(contentItemId) {
        removeContentItemFromCache(contentItemId)
      }

      return
    }
    let newSessionIssues = Object.assign({}, sessionIssues, { [issueId]: issueState})
    setSessionIssues(newSessionIssues)
  }

  const handleNewReport = (data) => {
    let newReport = report
    let newHasNewReport = hasNewReport
    let newDisableReview = disableReview
    if (data.messages) {
      data.messages.forEach((msg) => {
        if (msg.visible) {
          addMessage(msg)
        }
        if ('msg.no_report_created' === msg.message) {
          addMessage(msg)
          newReport = null
          newDisableReview = true
        }
        if ("msg.sync.course_inactive" === msg.message) {
          newDisableReview = true
        }
      })
    }
    if (data.data && data.data.id) {
      newReport = data.data
      newHasNewReport = true
    }
    setSyncComplete(true)
    setHasNewReport(newHasNewReport)
    setReport(newReport)
    if (newReport.contentSections) {
      setSections(newReport.contentSections)
    }
    else {
      setSections([])
    }
    setDisableReview(newDisableReview)
  }

  const handleNavigation = (newNavigation) => {
    if(newNavigation === navigation || !syncComplete) {
      return
    }
    if(newNavigation !== 'fixIssues') {
      setInitialSeverity('')
      setInitialSearchTerm('')
    }
    setNavigation(newNavigation)
  }

  const handleModal = (modal) => {
    setModal(modal)
  }

  const addMessage = (msg) => {
    setMessages(prevMessages => [...prevMessages, msg])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const quickIssues = (severity) => {
    setInitialSeverity(severity)
    setNavigation('fixIssues')
  }

  const quickSearchTerm = (searchTerm) => {
    setInitialSearchTerm(searchTerm)
    setNavigation('fixIssues')
  }

  const addContentItemToCache = (newContentItem) => {
    let newContentItemCache = Object.assign({}, contentItemCache)
    newContentItemCache[newContentItem.id] = newContentItem
    setContentItemCache(newContentItemCache)
  }

  const removeContentItemFromCache = (contentItemId) => {
    if(!contentItemId) {
      return
    }

    let newContentItemCache = Object.assign({}, contentItemCache)
    if(newContentItemCache[contentItemId]) {
      delete newContentItemCache[contentItemId]
    }
    setContentItemCache(newContentItemCache)
  }

  // When an issue has been saved, the page is rescanned and a new report is generated.
  // THIS MEANS THAT ALL OF THE UNRESOLVED ISSUES ON THAT PAGE WILL BE REMOVED and then
  // replaced (if necessary) in the new scan. The newIssue will PROBABLY have a valid
  // issueId in the new report (unless it was marked as UNresolved).
  const updateReportIssue = (newReport) => {
    if(!newReport) {
      return
    }
    const updatedReport = { ...newReport }
    setReport(updatedReport)
  }

  const updateReportFile = (newFile) => {
    let updatedReport = { ...report }
    console.log(updateReport)
    console.log(newFile)
    if (updatedReport && updatedReport.files) {
      updatedReport.files[newFile.id] = newFile
    }
    setReport(updatedReport)
  }

  const handleCourseRescan = () => {
    if (hasNewReport) {
      setHasNewReport(false)
      setSyncComplete(false)
      scanCourse()
        .then((response) => response.json())
        .then(handleNewReport)
    }
  }

  const handleFullCourseRescan = () => {
    if (hasNewReport) {
      setHasNewReport(false)
      setSyncComplete(false)
      fullRescan()
        .then((response) => response.json())
        .then(handleNewReport)
    }
  }

  const resizeFrame = useCallback(() => {
    let default_height = document.body.scrollHeight + 50
    default_height = default_height > 850 ? default_height : 850

    parent.postMessage(JSON.stringify({
      subject: "lti.frameResize",
      height: default_height
    }), "*")
  }, [])

  useEffect(() => {
    
    scanCourse()
      .then((response) => response.json())
      .then(handleNewReport)

    window.addEventListener("resize", resizeFrame)
    resizeFrame()

    return () => {
      window.removeEventListener('resize', resizeFrame)
    }
  }, [initialData.report, scanCourse, resizeFrame])

  return (
    <>
      { !welcomeClosed ?
        ( <WelcomePage
            t={t}
            settings={settings}
            syncComplete={syncComplete}
            setWelcomeClosed={setWelcomeClosed} /> ) :
        (
          <>
            <Header
              t={t}
              hasNewReport={hasNewReport}
              navigation={navigation}
              syncComplete={syncComplete}
              handleNavigation={handleNavigation}
             />

            <main role="main">
              {('summary' === navigation) &&
                <HomePage
                  t={t}
                  settings={settings.ISSUE_STATE ? settings : Object.assign({}, settings, { ISSUE_STATE })}
                  report={report}
                  hasNewReport={hasNewReport}
                  quickIssues={quickIssues}
                  sessionIssues={sessionIssues}
                />
              }
              {('fixIssues' === navigation) &&
                <FixIssuesPage
                  t={t}
                  settings={settings.ISSUE_STATE ? settings : Object.assign({}, settings, { ISSUE_STATE })}
                  initialSeverity={initialSeverity}
                  initialSearchTerm={initialSearchTerm}
                  contentItemCache={contentItemCache}
                  addContentItemToCache={addContentItemToCache}
                  report={report}
                  sections={sections}
                  setReport={setReport}
                  addMessage={addMessage}
                  handleNavigation={handleNavigation}
                  updateReportIssue={updateReportIssue}
                  updateReportFile={updateReportFile}
                  sessionIssues={sessionIssues}
                  updateSessionIssue={updateSessionIssue}
                  disableReview={syncComplete && !disableReview} />
              }
              {('reports' === navigation) &&
                <ReportsPage
                  t={t}
                  settings={settings}
                  report={report}
                  quickSearchTerm={quickSearchTerm}
                />
              }
              {('settings' === navigation) &&
                <SettingsPage
                  t={t}
                  settings={settings}
                  updateUserSettings={updateUserSettings}
                  syncComplete={syncComplete}
                  handleFullCourseRescan={handleFullCourseRescan} />
              }
              {('modal' === navigation) &&
                <div className="modal">
                  {modal}
                </div>
              }
            </main>
          </>
        )
      }
      <MessageTray t={t} messages={messages} clearMessages={clearMessages} hasNewReport={syncComplete} />
    </>
  )
}
