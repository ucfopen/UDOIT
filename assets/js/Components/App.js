import React, { useState, useCallback, useEffect } from 'react'
// import WelcomePage from './WelcomePage'
import HomePage from './HomePage'
// import Header from './Header'
import NewHeader from './NewHeader'
// import HomePage from './HomePage'
import SummaryPage from './SummaryPage'
import ContentPage from './ContentPage'
import FixIssuesPage from './FixIssuesPage'
import ReportsPage from './ReportsPage'
import AboutModal from './AboutModal'
import { View } from '@instructure/ui-view'
import Api from '../Services/Api'
import MessageTray from './MessageTray'
import FilesPage from './FilesPage'

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

  const [appFilters, setAppFilters] = useState({})
  const [navigation, setNavigation] = useState('home')
  const [modal, setModal] = useState(null)
  const [syncComplete, setSyncComplete] = useState(false)
  const [hasNewReport, setHasNewReport] = useState(false)
  const [disableReview, setDisableReview] = useState(false)
  const [initialSeverity, setInitialSeverity] = useState('')
  const [contentItemList, setContentItemList] = useState([])
  const [sessionIssues, setSessionIssues] = useState([])

  // `t` is used for text/translation. It will return the translated string if it exists
  // in the settings.labels object.
  const t = useCallback((key) => {
    return (settings.labels[key]) ? settings.labels[key] : key
  }, [settings.labels])

  const scanCourse = useCallback(() => {
    let api = new Api(settings)
    return api.scanCourse(settings.course.id)
  }, [settings])

  const fullRescan = useCallback(() => {
    let api = new Api(settings)
    return api.fullRescan(settings.course.id)
  }, [settings])

  // Session Issues are used to track progress when multiple things are going on at once,
  // and can allow the activeIssue to change without losing information about the previous issue.
  // Each issue has an id and state: { id: issueId, state: 2 }
  // The valid states are set and read in the FixIssuesPage component.
  const updateSessionIssue = (issueId, issueState = null) => {
    if(!issueState) {
      return
    }
    let newSessionIssues = [...sessionIssues]
    newSessionIssues[issueId] = issueState
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
    console.log('newReport: ', newReport)
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

  const handleNavigation = (navigation) => {
    setNavigation(navigation)
  }

  const handleModal = (modal) => {
    setModal(modal)
  }

  const handleAppFilters = (filters) => {
    setAppFilters(filters)
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

  const addContentItem = (newContentItem) => {
    let newContentItemList = Object.assign({}, contentItemList)
    newContentItemList[newContentItem.id] = newContentItem
    setContentItemList(newContentItemList)
  }

  const updateReportIssue = (newIssue, newReport) => {
    const updatedReport = ( newReport? { ...report, ...newReport } : {...report} )

    if (updatedReport && Array.isArray(updatedReport.issues)) {
      updatedReport.issues = updatedReport.issues.map((issue) => {
        if (issue.id === newIssue.id) return newIssue
        const oldIssue = report.issues.find((oldReportIssue) => oldReportIssue.id === issue.id)
        return oldIssue !== undefined ? { ...oldIssue, ...issue } : issue
      })
    }

    setReport(updatedReport)
  }

  const updateReportFile = (newFile, newReport) => {
    let updatedReport = { ...report, ...newReport }

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
    default_height = default_height > 1000 ? default_height : 1000

    parent.postMessage(JSON.stringify({
      subject: "lti.frameResize",
      height: default_height
    }), "*")
  }, [])

  useEffect(() => {
    if (settings.user && Array.isArray(settings.user.roles)) {
      if (settings.user.roles.includes('ROLE_ADVANCED_USER')) {
        if (initialData.report) {
          setReport(initialData.report)
          setNavigation('home')
        }
      }
    }

    scanCourse()
      .then((response) => response.json())
      .then(handleNewReport)

    window.addEventListener("resize", resizeFrame)
    resizeFrame()

    return () => {
      window.removeEventListener('resize', resizeFrame)
    }
  }, [settings, initialData.report, scanCourse, resizeFrame])

  return (
    <View as="div">
      <NewHeader
        t={t}
        settings={settings}
        hasNewReport={hasNewReport}
        navigation={navigation}
        handleNavigation={handleNavigation}
        handleCourseRescan={handleCourseRescan}
        handleFullCourseRescan={handleFullCourseRescan}
        handleModal={handleModal} />

      {(('home' !== navigation) && ('summary' !== navigation)) &&
        <SummaryBar t={t} report={report} />
      }

      <MessageTray t={t} messages={messages} clearMessages={clearMessages} hasNewReport={syncComplete} />

      <main role="main">
        {/* {('welcome' === navigation) &&
          <WelcomePage
            t={t}
            settings={settings}
            setSettings={setSettings}
            hasNewReport={hasNewReport}
            handleNavigation={handleNavigation} />
        } */}
        {('home' === navigation) &&
          <HomePage
            t={t}
            settings={settings}
            setSettings={setSettings}
            report={report}
            hasNewReport={hasNewReport}
            handleNavigation={handleNavigation} />
        }
        {('summary' === navigation) &&
          <>
            <SummaryPage
              t={t}
              settings={settings}
              report={report}
              handleAppFilters={handleAppFilters}
              handleNavigation={handleNavigation} />
            <div className="flex-row gap-1 mt-1">
              <button className="btn btn-primary" onClick={() => quickIssues('ISSUE')}>Fix Issues</button>
              <button className="btn btn-primary" onClick={() => quickIssues('POTENTIAL')}>Fix Potential Issues</button>
              <button className="btn btn-primary" onClick={() => quickIssues('SUGGESTION')}>Fix Suggestions</button>
            </div>
          </>
        }
        {('content' === navigation) &&
          <ContentPage
            t={t}
            settings={settings}
            report={report}
            setReport={setReport}
            appFilters={appFilters}
            handleAppFilters={handleAppFilters}
            handleNavigation={handleNavigation}
            handleIssueSave={updateReportIssue}
            handleIssueUpdate={updateReportIssue}
            disableReview={syncComplete && !disableReview} />
        }
        {('fixIssues' === navigation) &&
          <FixIssuesPage
            t={t}
            settings={settings}
            initialSeverity={initialSeverity}
            contentItemList={contentItemList}
            addContentItem={addContentItem}
            report={report}
            sections={sections}
            setReport={setReport}
            addMessage={addMessage}
            handleNavigation={handleNavigation}
            updateReportIssue={updateReportIssue}
            sessionIssues={sessionIssues}
            updateSessionIssue={updateSessionIssue}
            disableReview={syncComplete && !disableReview} />
        }
        {('files' === navigation) &&
          <FilesPage
            report={report}
            settings={settings}
            handleNavigation={handleNavigation}
            handleFileSave={updateReportFile}
            t={t} />
        }
        {('reports' === navigation) &&
          <ReportsPage
            t={t}
            settings={settings}
            report={report}
            handleNavigation={handleNavigation}
          />
        }
        
      </main>

      {('about' === modal) &&
        <AboutModal
          t={t}
          settings={settings}
          handleModal={handleModal} />
      }
    </View>
  )
}


