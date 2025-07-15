import React, { useState, useCallback, useEffect } from 'react'
import Header from './Header'
import WelcomePage from './WelcomePage'
import HomePage from './HomePage'
import FixIssuesPage from './FixIssuesPage'
import ReportsPage from './ReportsPage'
import SettingsPage from './SettingsPage'
import Api from '../Services/Api'
import MessageTray from './MessageTray'
import { analyzeReport } from '../Services/Report'


export default function App(initialData) {

  const [messages, setMessages] = useState(initialData.messages || [])
  const [report, setReport] = useState(initialData.report || null)  
  const [settings, setSettings] = useState(initialData.settings || null)
  const [sections, setSections] = useState([])

  const [navigation, setNavigation] = useState('summary')
  const [syncComplete, setSyncComplete] = useState(false)
  const [hasNewReport, setHasNewReport] = useState(false)
  const [initialSeverity, setInitialSeverity] = useState('')
  const [initialSearchTerm, setInitialSearchTerm] = useState('')
  const [contentItemCache, setContentItemCache] = useState([])
  const [sessionIssues, setSessionIssues] = useState({})
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

  const processNewReport = (rawReport) => {
    const tempReport = analyzeReport(rawReport, ISSUE_STATE)
    setReport(tempReport)
    
    if (tempReport.contentSections) {
      setSections(tempReport.contentSections)
    }
    else {
      setSections([])
    }

    if(tempReport.sessionIssues) {
      setSessionIssues(tempReport.sessionIssues)
    }

    let tempContentItems = {}
    for(const key in tempReport.contentItems) {
      tempContentItems[key] = tempReport.contentItems[key]
    }
    setContentItemCache(tempContentItems)
  }

  const handleNewReport = (data) => {
    if(!data || !data.data) {
      setSyncComplete(true)
      setHasNewReport(false)
      return
    }

    let newReport = report
    let newHasNewReport = hasNewReport
    if (data.messages) {
      data.messages.forEach((msg) => {
        if (msg.visible) {
          addMessage(msg)
        }
      })
    }
    if (data.data && data.data.id) {
      newReport = data.data
      newHasNewReport = true
    }
    setSyncComplete(true)
    setHasNewReport(newHasNewReport)

    if(newHasNewReport) {
      processNewReport(newReport)
    }
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

  const addMessage = (msg) => {
    setMessages([msg])
    // setMessages(prevMessages => [...prevMessages, msg])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const processServerError = (response) => {
    let status = response.status || 500
    let errorMessage = ''
    switch (status) {
      case 400:
        errorMessage = t('msg.sync.error.api')
        break
      case 401:
        errorMessage = t('msg.sync.error.unauthorized')
        break
      case 403:
        errorMessage = t('msg.sync.error.forbidden')
        break
      case 404:
        errorMessage = t('msg.sync.error.not_found')
        break
      case 500:
        errorMessage = 'Internal Server Error: Please try again later.'
        break
      default:
        errorMessage = t('msg.sync.error.connection')
    }
    addMessage({message: errorMessage, severity: 'error', visible: true})
    console.error(`Error: ${errorMessage} (Status: ${status})`)
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

  const handleFullCourseRescan = () => {
    if (hasNewReport) {
      setHasNewReport(false)
      setSyncComplete(false)
      try {
        fullRescan()
          .then((responseStr) => {
            // Check for HTTP errors before parsing JSON
            if (!responseStr.ok) {
              processServerError(responseStr)
              return null
            }
            return responseStr.json()
          })
          .then(handleNewReport)
      } catch (error) {
        addMessage({message: `${t('msg.sync.failed')}: ${t(error)}`, severity: 'error', visible: true})
        console.error("Error scanning course:", error)
      }
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
    document.addEventListener('visibilitychange', function() {
      if(document.hidden) {
        console.warn("UDOIT has lost focus. Course content may be changed.")
      }
      else {
        // There is probably a case for checking the page you're currently editing to make sure that there weren't any changes in the LMS.
        addMessage({message: 'Welcome back to UDOIT! If you have changed any course content, please refresh this page to rescan.', severity: 'info', visible: true})
      }
    })
  }, [])

  useEffect(() => {
    
    try {
      scanCourse()
        .then((responseStr) => {
        // Check for HTTP errors before parsing JSON
          if (!responseStr.ok) {
            processServerError(responseStr)
            return null
          }
          return responseStr.json()
        })
        .then(handleNewReport)
    } catch (error) {
      addMessage({message: `${t('msg.sync.failed')}: ${t(error)}`, severity: 'error', visible: true})
      console.error("Error scanning course:", error)
    }

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

            <main role="main" className="pt-2">
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
                  processNewReport={processNewReport}
                  addMessage={addMessage}
                  handleNavigation={handleNavigation}
                  sessionIssues={sessionIssues}
                  updateSessionIssue={updateSessionIssue}
                  processServerError={processServerError}
                />
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
