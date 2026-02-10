import React, { useState, useEffect } from 'react'
import ProgressCircle from './Widgets/ProgressCircle'
import ProgressIcon from './Icons/ProgressIcon'
import SeverityIcon from './Icons/SeverityIcon'
import './HomePage.css'
import SummaryIcon from './Icons/SummaryIcon'
import UFIXITIcon from './Icons/UFIXITIcon'

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

  const [issueCount, setIssueCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [potentialCount, setPotentialCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [fileCount, setFileCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [combinedCount, setCombinedCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [dailyCount, setDailyCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [totalsCounted, setTotalsCounted] = useState(false)
  
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
    { step: 1, type: "ISSUE", translationKey: 'issues', counter: issueCount },
    { step: 2, type: "POTENTIAL", translationKey: 'potentials', counter: potentialCount },
    { step: 3, type: "FILE", translationKey: 'files', counter: fileCount }
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

    setIssueCount({
      "fixed": tempTotalIssuesFixed,
      "total": tempTotalIssues,
      "percent": (tempTotalIssues === 0 ? 0 : (tempTotalIssuesFixed/tempTotalIssues) * 100)
    })
    setPotentialCount({
      "fixed": tempTotalPotentialIssuesFixed,
      "total": tempTotalPotentialIssues,
      "percent": (tempTotalPotentialIssues === 0 ? 0 : (tempTotalPotentialIssuesFixed/tempTotalPotentialIssues) * 100)
    })
    setFileCount({
      "fixed": tempTotalFilesReviewed,
      "total": tempTotalFiles,
      "percent": (tempTotalFiles === 0 ? 0 : (tempTotalFilesReviewed/tempTotalFiles) * 100)
    })
    setCombinedCount({
      "fixed": tempTotalIssuesFixed + tempTotalPotentialIssuesFixed + tempTotalFilesReviewed,
      "total": tempTotalIssues + tempTotalPotentialIssues + tempTotalFiles,
      "percent": (tempTotalIssues + tempTotalPotentialIssues + tempTotalFiles === 0 ? 0 : (tempTotalIssuesFixed + tempTotalPotentialIssuesFixed + tempTotalFilesReviewed) / (tempTotalIssues + tempTotalPotentialIssues + tempTotalFiles) * 100)
    })
    
    setTotalsCounted(true)
  }, [hasNewReport])

  return (
  <div className="flex-column flex-grow-1">
    <div className="flex-row justify-content-between gap-4">
      <h1 className="primary-dark">{t('summary.title')}</h1>
      <div className="flex-column flex-center flex-shrink-0">
        <div className="flex-row justify-content-end">
          { !syncComplete ? (
            <button className="btn-small btn-icon-left" tabIndex="0" disabled>
              <ProgressIcon className="icon-sm spinner" />
              <div className="flex-column justify-content-center">
                {t('welcome.button.scanning')}
              </div>
            </button>
            ) : (
              <button
                onClick={() => handleFullCourseRescan()}
                className="btn-small btn-icon-left btn-secondary"
                tabIndex="0">
                  <SummaryIcon className="icon-sm" />
                  <div className="flex-column justify-content-center">
                    {t('settings.button.force_full_rescan')}
                  </div>
                </button>
            )
          }
        </div>
      </div>
    </div>
    <div className="flex-row w-100 mb-4 justify-content-between gap-4">
      <div className="flex-column flex-center w-75">
        <p className="mt-0 mb-0">{t('summary.description')}</p>
      </div>

    </div>

    <div className="summary-container">
      <div className="progress-column flex-column gap-2">

        { panels.map((panel) => (
          <div className="callout-container flex-column" key={"panel-" + panel.step}>
            <div className="flex-row justify-content-start gap-2 pb-1">
              <div className="flex-column justify-content-start">
                <SeverityIcon type={panel.type} filled='true' className='icon-lg' />
              </div>
              <div className="flex-column justify-content-center">
                <h2 className="callout-heading">{t('summary.label.step' + panel.step)} - {t('summary.label.' + panel.translationKey)}</h2>
              </div>
            </div>

            <div className="separator" />

            <div className="flex-row justify-content-start gap-3">

              <div className="flex-column flex-grow-1 justify-content-between gap-2 mt-3">
                <div className="step-summary">{t('summary.' + panel.translationKey + '.description', {count: panel.counter.total})}</div>
                <div className="flex-row justify-content-start flex-shrink-0">
                  <button className="btn-icon-left btn-primary btn-small"
                    disabled={!syncComplete}
                    onClick={() => quickIssues(panel.type)}>
                      <UFIXITIcon className="icon-sm" />
                      <div className="flex-column justify-content-center">
                        {t('summary.button.fix_' + panel.translationKey)}
                      </div>
                  </button>
                </div>
              </div>
              <div className="flex-column progress-container">
                <div className="flex-row justify-content-center">
                  <div className="svg-container mt-3">
                    <ProgressCircle
                      percent={panel.counter.percent}
                      radius={progressMeterRadius()}
                      circlePortion={75}/>
                    <div className="progress-text-container flex-column justify-content-center">
                      <div className="progress-text">{panel.counter.percent.toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
                <div className="count-summary">
                  {t('summary.' + panel.translationKey + '_resolved', {resolved: panel.counter.fixed, total: panel.counter.total})}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="info-column flex-column">
        <div className="callout-container flex-column">
          <h2 className="pb-1 callout-heading text-center">{t('summary.label.course_progress')}</h2>
          <div className="separator" />
          <div className="flex-row justify-content-evenly gap-3">
            <div className="flex-column progress-container">
              <div className="flex-row justify-content-center">
                <div className="progress-label">{t('summary.label.overall_progress')}</div>
              </div>
              <div className="flex-row justify-content-center">
                <div className="svg-container mt-3">
                  <ProgressCircle
                    percent={combinedCount.percent}
                    radius={progressMeterRadius() * 1.5}
                    circlePortion={75}
                    strokeWidth={15}/>
                  <div className="progress-text-container flex-column justify-content-center">
                    <div className="progress-text">{combinedCount.percent.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
              <div className="count-summary">
                {t('summary.number_resolved', {resolved: combinedCount.fixed, total: combinedCount.total})}
              </div>
            </div>

            <div className="flex-column progress-container">
              <div className="flex-row justify-content-center">
                <div className="progress-label">{t('summary.label.daily_progress')}</div>
              </div>
              <div className="flex-row justify-content-center">
                <div className="svg-container mt-3">
                  <ProgressCircle
                    percent={dailyCount.percent}
                    radius={progressMeterRadius() * 1.5}
                    circlePortion={75}
                    strokeWidth={15}/>
                  <div className="progress-text-container flex-column justify-content-center">
                    <div className="progress-text">{dailyCount.percent.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
              <div className="count-summary">
                {t('summary.number_resolved', {resolved: dailyCount.fixed, total: dailyCount.total})}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center flex-column mt-4 p-4">
          <h2 className="mt-0">Your Feedback is Requested!</h2>
          <p>This version of UDOIT is currently in development. While we're very proud of this version, we're still finding issues and would love any feedback you could provide.</p>
          <div className="mb-2"><a href='https://form.asana.com/?k=fM-ii4jhXi1ff574xnf-ig&d=941449628608720' target='_blank' rel='noopener noreferrer'>Quick Question or Bug Report</a></div>
          <div className="mb-4"><a href='https://form.asana.com/?k=_WTU9I8AhlBXFKYkduprvg&d=941449628608720' target='_blank' rel='noopener noreferrer'>User Feedback Survey</a></div>
          <div><a href='https://ucf.service-now.com/ucfit?id=kb_article_view&sys_kb_id=408fe7021bb162102fc664a2604bcb3e&table=kb_knowledge&searchTerm=Udoit' target='_blank' rel='noopener noreferrer'>Learn About UDOIT</a></div>
        </div>
      </div>

    </div>
  </div>
  )
}