import React, { useState, useEffect } from 'react'
import ProgressCircle from './Widgets/ProgressCircle'
import ContentAnnouncementIcon from './Icons/ContentAnnouncementIcon'
import ContentPageIcon from './Icons/ContentPageIcon'
import InfoIcon from './Icons/InfoIcon'
import ProgressIcon from './Icons/ProgressIcon'
import RightArrowIcon from './Icons/RightArrowIcon'
import SeverityIcon from './Icons/SeverityIcon'
import SummaryIcon from './Icons/SummaryIcon'
import * as Html from '../Services/Html'
import './HomePage.css'

export default function HomePage({
  t,
  settings,
  report,
  hasNewReport,
  quickIssues,
  sessionIssues,
  syncComplete,
  handleFullCourseRescan
}) {

  const BARRIERS = {
    ISSUE: settings.ISSUE_FILTER.ISSUE,
    POTENTIAL: settings.ISSUE_FILTER.POTENTIAL,
    FILE: settings.ISSUE_FILTER.FILE
  }

  const [issueCount, setIssueCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [potentialCount, setPotentialCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [fileCount, setFileCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [combinedCount, setCombinedCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [dailyCount, setDailyCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [emphasis, setEmphasis] = useState('')
  
  const progressMeterRadius = () => {
    switch (settings?.user?.roles?.font_size) {
      case 'font-small':
        return 40;
      case 'font-normal':
        return 45;
      case 'font-large':
        return 50;
      case 'font-xlarge':
        return 60;
      default:
        return 40;
    }
  }

  const panels = [
    { step: 1, type: BARRIERS.ISSUE, translationKey: 'issues', counter: issueCount },
    { step: 2, type: BARRIERS.POTENTIAL, translationKey: 'potentials', counter: potentialCount },
    { step: 3, type: BARRIERS.FILE, translationKey: 'files', counter: fileCount }
  ]

  useEffect(() => {
    let totalIssuesFixed = 0
    let dailyGoal = settings?.user?.roles?.daily_goal || 10
    let percentComplete = 0
    if(sessionIssues && Object.keys(sessionIssues).length > 0) {
      for (const issueState of Object.values(sessionIssues)) {
        if(issueState === settings.ISSUE_STATE.SAVED || issueState === settings.ISSUE_STATE.RESOLVED) {
          totalIssuesFixed += 1
        }
      }
    }

    if(totalIssuesFixed >= dailyGoal) {
      percentComplete = 100
    }
    else {
      percentComplete = (totalIssuesFixed / dailyGoal) * 100
    }

    setDailyCount({
      fixed: totalIssuesFixed,
      total: dailyGoal,
      percent: percentComplete
    })
  }, [settings?.user?.roles?.daily_goal])

  useEffect(() => {
    if (!hasNewReport) return

    let tempTotalIssues = 0
    let tempTotalPotentialIssues = 0
    let tempTotalIssuesFixed = 0
    let tempTotalPotentialIssuesFixed = 0
    let tempTotalFiles = 0
    let tempTotalFilesReviewed = 0

    if(report.issues && report.issues.length > 0) {
      for (const i of report.issues){
        if(i.type === 'error') {
          tempTotalIssues += 1
          if (i.status !== 0) {
            tempTotalIssuesFixed += 1
          }
        }
        else if (i.type === 'potential' || i.type === 'suggestion'){
          tempTotalPotentialIssues +=1
          if (i.status !== 0) {
            tempTotalPotentialIssuesFixed += 1
          }
        }
      }
    }

    if (report.files) {
      for (const [key, fileData] of Object.entries(report.files)) {
        tempTotalFiles += 1
        if (fileData.reviewed) {
          tempTotalFilesReviewed += 1
        }
      }
    }

    const tempTotalCombined = tempTotalIssues + tempTotalPotentialIssues + tempTotalFiles
    const tempTotalCombinedFixed = tempTotalIssuesFixed + tempTotalPotentialIssuesFixed + tempTotalFilesReviewed

    setIssueCount({
      "fixed": tempTotalIssuesFixed,
      "total": tempTotalIssues,
      "percent": (tempTotalIssues === 0 || tempTotalIssuesFixed === tempTotalIssues ? 100 : (tempTotalIssuesFixed/tempTotalIssues) * 100)
    })
    setPotentialCount({
      "fixed": tempTotalPotentialIssuesFixed,
      "total": tempTotalPotentialIssues,
      "percent": (tempTotalPotentialIssues === 0 || tempTotalPotentialIssuesFixed === tempTotalPotentialIssues ? 100 : (tempTotalPotentialIssuesFixed/tempTotalPotentialIssues) * 100)
    })
    setFileCount({
      "fixed": tempTotalFilesReviewed,
      "total": tempTotalFiles,
      "percent": (tempTotalFiles === 0 || tempTotalFilesReviewed === tempTotalFiles ? 100 : (tempTotalFilesReviewed/tempTotalFiles) * 100)
    })
    setCombinedCount({
      "fixed": tempTotalCombinedFixed,
      "total": tempTotalCombined,
      "percent": (tempTotalCombined === 0 || tempTotalCombinedFixed === tempTotalCombined ? 100 : (tempTotalCombinedFixed / tempTotalCombined) * 100)
    })

    if(tempTotalIssuesFixed < tempTotalIssues) {
      setEmphasis(BARRIERS.ISSUE)
    }
    else if(tempTotalPotentialIssuesFixed < tempTotalPotentialIssues) {
      setEmphasis(BARRIERS.POTENTIAL)
    }
    else if(tempTotalFilesReviewed < tempTotalFiles) {
      setEmphasis(BARRIERS.FILE)
    }
    else {
      setEmphasis('')
    }

  }, [hasNewReport])

  return (
    <div className="flex-column flex-grow-1">
      <div className="pageTitleRow">
        <h1 className="pageTitle">{t('summary.title')}</h1>
        { !syncComplete ? (
          <button className="btn-small btn-icon-left" tabIndex="0" disabled>
            <ProgressIcon className="icon-sm spinner" />
            <div className="flex-column justify-content-center">
              {t('welcome.label.scanning')}
            </div>
          </button>
          ) : (
            <button
              onClick={() => handleFullCourseRescan()}
              className="btn-small btn-icon-left btn-secondary"
              tabIndex="0">
                <SummaryIcon className="icon-md" />
                <div className="flex-column justify-content-center">
                  {t('settings.button.force_full_rescan')}
                </div>
              </button>
          )
        }
      </div>
      <p className="pageSubtitle">{t('summary.description')}</p>

    <div className="summary-container">
      <div className="progress-column flex-column gap-2">

        { panels.map((panel) => (
          <div className={`resolution-container flex-column type-` + `${panel.type.toLowerCase()}` + `${emphasis === panel.type ? ' emphasis' : ''}`} key={"panel-" + panel.type}>
            
            <div className="flex-row gap-3 w-100">
              <div className='summary-icon-container' aria-hidden="true">
                <SeverityIcon type={panel.type} className='icon-lg' />
              </div>
              <div className="summary-text-container">
                <h2 className="mt-0">{t('summary.label.' + panel.translationKey)}</h2>
                <div aria-label={Html.getTextContent('<p>' + t('summary.' + panel.translationKey + '.description', {count: panel.counter.total}) + '</p>')}>
                  <div
                    className="subtext"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{__html: t('summary.' + panel.translationKey + '.description', {count: panel.counter.total})}}
                    />
                </div>
              </div>
              <div className="summary-percent-container">
                <div className="subtext text-end">
                  {t('summary.' + panel.translationKey + '_resolved', {resolved: panel.counter.fixed, total: panel.counter.total})}
                </div>

                <div className="progress-bar-container mt-1">
                  <div className="progress-bar-fill" style={{width: `${panel.counter.percent}%`}}></div>
                </div>

                <button className="btn-secondary btn-icon-right justify-content-center mt-2"
                  aria-label={t('summary.label.' + panel.translationKey)}
                  disabled={!syncComplete}
                  onClick={() => quickIssues(panel.type)}>
                    <div className="flex-column justify-content-center">
                      {t('summary.button.fix_' + panel.translationKey)}
                    </div>
                    <RightArrowIcon className="icon-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="widget-container">
        <div className="callout-container feedback-container flex-column h-fit p-4 flex-grow-1">
          <h2 className="mt-0 text-center">{t('summary.label.course_progress')}</h2>
          <div className="flex-row align-self-center">
            <div className="flex-column progress-container">
              <div className="flex-row justify-content-center" aria-label={`${combinedCount.percent.toFixed(0)}%`}>
                <div className="svg-container mt-3" aria-hidden="true">
                  <ProgressCircle
                    percent={combinedCount.percent}
                    radius={progressMeterRadius() * 1.5}
                    circlePortion={100}
                    strokeWidth={15}/>
                  <div className="progress-text-container flex-column justify-content-center">
                    <div className="progress-text">{combinedCount.percent.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
              <div className="subtext text-center mt-3">
                {t('summary.number_resolved', {resolved: combinedCount.fixed, total: combinedCount.total})}
              </div>
            </div>
          </div>
        </div>

        <div className="callout-container filled-container feedback-container flex-column p-4 h-fit flex-grow-1 align-self-end">
          <h2 className="mt-0 mb-4">Help & Feedback</h2>
          <div className="flex-row mb-3">
            <InfoIcon className="icon-md me-2 link-color align-self-center" aria-hidden="true" />
            <a href='https://ucf.service-now.com/ucfit?id=kb_article_view&sys_kb_id=408fe7021bb162102fc664a2604bcb3e&table=kb_knowledge&searchTerm=Udoit' target='_blank' rel='noopener noreferrer' className='align-self-center'>Learn About UDOIT</a>
          </div>
          <div className="flex-row mb-3">
            <ContentAnnouncementIcon className="icon-md me-2 link-color align-self-center" aria-hidden="true" />
            <a href='https://form.asana.com/?k=fM-ii4jhXi1ff574xnf-ig&d=941449628608720' target='_blank' rel='noopener noreferrer' className='align-self-center'>Report an Issue</a>
          </div>
          <div className="flex-row mb-0">
            <ContentPageIcon className="icon-md me-2 link-color align-self-center" aria-hidden="true" />
            <a href='https://form.asana.com/?k=_WTU9I8AhlBXFKYkduprvg&d=941449628608720' target='_blank' rel='noopener noreferrer' className='align-self-center'>User Feedback Survey</a>
          </div>
        </div>
      </div>

    </div>
  </div>
  )
}