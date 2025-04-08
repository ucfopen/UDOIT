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
=======
    <>
      { !welcomeClosed ?
        ( <WelcomePage
            t={t}
            syncComplete={syncComplete}
            setWelcomeClosed={setWelcomeClosed} /> ) :
        (
          <>
            <Header
              t={t}
              settings={settings}
              hasNewReport={hasNewReport}
              navigation={navigation}
              handleNavigation={handleNavigation}
              handleCourseRescan={handleCourseRescan}
              handleFullCourseRescan={handleFullCourseRescan}
              handleModal={handleModal} />

            <MessageTray t={t} messages={messages} clearMessages={clearMessages} hasNewReport={syncComplete} />

            <main role="main">
              {/* {('home' === navigation) &&
                <HomePage
                  t={t}
                  settings={settings}
                  report={report} />
              } */}
              {/* {('welcome' === navigation) &&
                <>
                  <WelcomePage
                    t={t}
                    settings={settings}
                    setSettings={setSettings}
                    hasNewReport={hasNewReport}
                    handleNavigation={handleNavigation} />
                  <div className="flex-row gap-1 mt-1">
                    <button className="btn btn-primary" onClick={() => quickIssues('ISSUE')}>Fix Issues</button>
                    <button className="btn btn-primary" onClick={() => quickIssues('POTENTIAL')}>Fix Potential Issues</button>
                    <button className="btn btn-primary" onClick={() => quickIssues('SUGGESTION')}>Fix Suggestions</button>
                  </div>
                </>
              } */}
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
          </>
        )