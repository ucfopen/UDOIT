import React, { useState, useCallback, useEffect } from 'react'
import Header from './Header'
import WelcomePage from './WelcomePage'
import HomePage from './HomePage'
import FixIssuesPage from './FixIssuesPage'
import ReviewFilesPage from './ReviewFilesPage'
import ReportsPage from './ReportsPage'
import SettingsPage from './SettingsPage'
import Api from '../Services/Api'
import MessageTray from './Widgets/MessageTray'
import { analyzeReport } from '../Services/Report'
import { ISSUE_STATE, WIDGET_STATE, ISSUE_FILTER, FILE_FILTER, FILE_TYPES, FILE_TYPE_MAP, DEFAULT_USER_SETTINGS } from '../Services/Settings'


export default function App(initialData) {

  const [nextMessage, setNextMessage] = useState('')
  const [untranslatedMessage, setUntranslatedMessage] = useState('')
  const [report, setReport] = useState(initialData.report || null)  
  const [settings, setSettings] = useState(Object.assign({},
    initialData?.settings || {}, 
    { ISSUE_STATE }, 
    { WIDGET_STATE }, 
    { ISSUE_FILTER }, 
    { FILE_FILTER },
    { FILE_TYPES },
    { FILE_TYPE_MAP },
    { DEFAULT_USER_SETTINGS }
  ))
  const [sections, setSections] = useState([])

  const [navigation, setNavigation] = useState('summary')
  const [syncComplete, setSyncComplete] = useState(false)
  const [hasNewReport, setHasNewReport] = useState(false)
  const [initialSeverity, setInitialSeverity] = useState('')
  const [initialSearchTerm, setInitialSearchTerm] = useState('')
  const [contentItemCache, setContentItemCache] = useState([])
  const [sessionIssues, setSessionIssues] = useState({})
  const [sessionFiles, setSessionFiles] = useState({})
  const [welcomeClosed, setWelcomeClosed] = useState(false)

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

  // When user settings are updated and the language changes, we need to send alerts, but also wait a tick for the settings to update.
  // Using the setUntranslatedMessage function will wait for the next render cycle to update the message, with the new language settings.
  useEffect(() => {
    let message = t(untranslatedMessage?.message || '')
    let severity = untranslatedMessage?.severity || 'info'
    let visible = untranslatedMessage?.visible || false

    if (message === '') {
      return
    }

    if (visible) {
      addMessage({ message: message, severity: severity, visible: true })
    }
    else if (severity === 'error' || severity === 'alert') {
      console.error(message)
    } else {
      console.log(message)
    }
  }, [untranslatedMessage])

  const updateUserSettings = (newUserSetting) => {
    let oldSettings = JSON.parse(JSON.stringify(settings))
    let newRoles = Object.assign({}, settings.user.roles, newUserSetting)
    let newUser = Object.assign({}, settings.user, { 'roles': newRoles})
    let newSettings = Object.assign({}, settings, { user: newUser })
    setSettings(newSettings)

    let api = new Api(settings)
    api.updateUser(newUser)
      .then((response) => response.json())
      .then((data) => {
        if(data.user) {
          newSettings.user = data.user
          if(data?.labels?.lang) {
            let newLanguageSettings = Object.assign({}, newSettings)
            newLanguageSettings.lang = data?.language || newSettings.lang
            newLanguageSettings.labels = data.labels
            setSettings(newLanguageSettings)
          }
          setUntranslatedMessage({ message: 'msg.settings.updated', severity: 'success', visible: true })
        }
        else {
          setSettings(oldSettings)
          setUntranslatedMessage({ message: 'msg.settings.update_failed', severity: 'error', visible: true })
        }
    })
  }

  // Session Issues are used to track progress when multiple things are going on at once,
  // and can allow the activeIssue to change without losing information about the previous issue.
  // Each issue has an id and state: { id: issueId, state: 2 }
  // The valid states are set and read in the FixIssuesPage component.
  const updateSessionIssue = (issueId, issueState = null, contentItemId = null) => {
    if(issueState === null || issueState === settings.ISSUE_STATE.UNCHANGED) {
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

    const updateSessionFiles = (fileId, fileState = null, contentItemId = null) => {
    if(fileState === null || fileState === settings.ISSUE_STATE.UNCHANGED) {
      let newSessionFiles = Object.assign({}, sessionFiles)
      if(newSessionFiles[fileId]) {
        delete newSessionFiles[fileId]
      }
      setSessionFiles(newSessionFiles)

      if(contentItemId) {
        removeContentItemFromCache(contentItemId)
      }

      return
    }
    let newSessionFiles = Object.assign({}, sessionFiles, { [fileId]: fileState})
    setSessionFiles(newSessionFiles)
  }

  const processNewReport = (rawReport) => {
    const tempReport = analyzeReport(rawReport, settings.ISSUE_STATE)
    setReport(tempReport)

    let api = new Api(settings)
    api.setReportData(tempReport.id, {'scanCounts': tempReport.scanCounts, 'scanRules': tempReport.scanRules})
      .then((response) => response.json())
      .then((data) => {
        if(data.errors && data.errors.length > 0) {
          data.errors.forEach((error) => {
            addMessage({ message: error, severity: 'error', visible: true })
          })
        }
      })
      .catch((error) => {
        addMessage({ message: t('msg.sync.error.api'), severity: 'error', visible: true })
      })

    if (tempReport.contentSections) {
      setSections(tempReport.contentSections)
    }
    else {
      setSections([])
    }

    if(tempReport.sessionIssues) {
      setSessionIssues(tempReport.sessionIssues)
    }

    if(tempReport.sessionFiles){
      setSessionFiles(tempReport.sessionFiles)
    }

    let tempContentItems = {}
    for(const key in tempReport.contentItems) {
      tempContentItems[key] = tempReport.contentItems[key]
    }

    setContentItemCache(tempContentItems)
    return tempReport 
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
    setNextMessage(msg)
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
    if(severity === 'FILE'){
      setNavigation('reviewFiles')
      return
    }
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

  // Every time the translation function changes, we need to recompute the page visibility listener.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.warn("UDOIT has lost focus. Course content may be changed.")
      } else {
        // There is probably a case for checking the page you're currently editing to make sure that there weren't any changes in the LMS.
        // For now, just let the user know that they should refresh if they made changes.
        addMessage({message: t('msg.return_focus'), severity: 'info', visible: true})
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [t])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = '../udoit3/build/static/tinymce/tinymce.min.js'
    script.async = true
    document.body.appendChild(script)
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
  }, [initialData.report, scanCourse])

  return (
    <div id="app-container"
         className={`flex-column flex-grow-1 `
          + `${settings?.user?.roles?.font_size || settings.DEFAULT_USER_SETTINGS.FONT_SIZE} `
          + `${settings?.user?.roles?.font_family || settings.DEFAULT_USER_SETTINGS.FONT_FAMILY} `
          + `${settings?.user?.roles?.dark_mode ? 'dark-mode' : ''}`}>
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
              settings={settings}
              hasNewReport={hasNewReport}
              navigation={navigation}
              syncComplete={syncComplete}
              handleNavigation={handleNavigation}
             />

            <main role="main">
              {('summary' === navigation) &&
                <HomePage
                  t={t}
                  settings={settings}
                  report={report}
                  hasNewReport={hasNewReport}
                  quickIssues={quickIssues}
                  sessionIssues={sessionIssues}
                  syncComplete={syncComplete}
                  handleFullCourseRescan={handleFullCourseRescan}
                />
              }
              {('fixIssues' === navigation) &&
                <FixIssuesPage
                  t={t}
                  settings={settings}
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
              {('reviewFiles' === navigation) &&
                <ReviewFilesPage
                  t={t}
                  settings={settings}
                  contentItemCache={contentItemCache}
                  addContentItemToCache={addContentItemToCache}
                  report={report}
                  sections={sections}
                  processNewReport={processNewReport}
                  addMessage={addMessage}
                  handleNavigation={handleNavigation}
                  sessionFiles={sessionFiles}
                  updateSessionFiles={updateSessionFiles}
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
      <MessageTray
        t={t}
        settings={settings}
        nextMessage={nextMessage}
      />
    </div>
  )
}