import React, { useState, useEffect } from 'react'
import ProgressBar from './ProgressBar'
import SeverityIcon from './Icons/SeverityIcon'
import './HomePage.css'
import DailyProgress from './DailyProgress'

export default function HomePage({
  t,
  settings,
  report,
  hasNewReport,
  quickIssues,
  sessionIssues
}) {

  const [issueCount, setIssueCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [potentialCount, setPotentialCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [suggestionCount, setSuggestionCount] = useState({"fixed": 0, "total": 0, "percent": 0})
  const [totalsCounted, setTotalsCounted] = useState(false)

  // const [totalIssues, setTotalIssues] = useState(0)
  // const [totalPotentialIssues, setTotalPotentialIssues] = useState(0)
  // const [totalSuggestions, setTotalSuggestions] = useState(0)
  
  // const [issuePercent, setIssuePercent] = useState(0)
  // const [potentialPercent, setPotentialPercent] = useState(0)
  // const [suggestionPercent, setSuggestionPercent] = useState(0)

  useEffect(() => {
    if (!hasNewReport) return

    let tempTotalIssues = 0
    let tempTotalPotentialIssues = 0
    let tempTempTotalSuggestions = 0
    let tempTotalIssuesFixed = 0
    let tempTotalPotentialIssuesFixed = 0
    let tempTotalSuggestionsFixed = 0

    if(report.issues && report.issues.length > 0) {
      for (const i of report.issues){
        if(i.type === 'error') {
          tempTotalIssues += 1
          if (i.status === 1 || i.status === 2) {
            tempTotalIssuesFixed += 1
          }
        }
        else if (i.type === 'potential'){
          tempTotalPotentialIssues +=1
          if (i.status === 1 || i.status === 2) {
            tempTotalPotentialIssuesFixed += 1
          }
        }
        else if (i.type === 'suggestion') {
          tempTempTotalSuggestions +=1
          if (i.status === 1 || i.status === 2) {
            tempTotalSuggestionsFixed += 1
          }
        }
      }
    }

    if (report.files) {
      for (const [key, fileData] of Object.entries(report.files)) {
        tempTotalPotentialIssues += 1
        if (fileData.reviewed) {
          tempTotalPotentialIssuesFixed += 1
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
    setSuggestionCount({
      "fixed": tempTotalSuggestionsFixed, 
      "total": tempTempTotalSuggestions,
      "percent": (tempTempTotalSuggestions === 0 ? 0 : (tempTotalSuggestionsFixed/tempTempTotalSuggestions) * 100)
    })
    
    setTotalsCounted(true)
  }, [hasNewReport])

  return (
  <main>
    <div className='flex-column gap-3 mt-4 mb-4'>
      <h1 className="primary-dark mt-0 mb-0">{t('summary.title')}</h1>
      <div className="flex-row w-50">
        <p className="mt-0 mb-0">{t('summary.description')}</p>
      </div>
      
    </div>
    <div className="flex-row gap-3">
      <div className="report-container flex-column">
        { setTotalsCounted && (
          <>
            <div className='flex-column w-100 mb-3'>
              <div className="flex-row w-100 justify-content-between mb-1">
                <div className='flex-row'>
                  <div className='flex-column justify-content-center mr-1'>
                  <SeverityIcon type="ISSUE" className='icon-lg' />
                  </div>
                  <div className='flex-column justify-content-center'>
                    <h3 className='mb-0 mt-0'>{t('filter.label.severity.issue')}</h3>
                  </div>
                </div>
                <div className='flex-column justify-content-end'>
                  <div className="errors-progress-bar">{t('summary.issues_resolved', {resolved: issueCount.fixed, total: issueCount.total})}</div>
                </div>
              </div>
              <ProgressBar progress={issueCount.percent} />
              <div className="flex-row w-100 justify-content-between mt-2 gap-2">
                <div>{t('summary.issues.description')}</div>
                <div className='flex-column justify-content-start flex-shrink-0'>
                  <button className="btn btn-primary" onClick={() => quickIssues('ISSUE')}>{t('summary.button.fix_issues')}</button>
                </div>
              </div>
            </div>
            <div className='flex-column w-100 mb-3'>
              <div className="flex-row w-100 justify-content-between mb-1">
                <div className='flex-row'>
                  <div className='flex-column justify-content-center mr-1'>
                  <SeverityIcon type="POTENTIAL" className='icon-lg' />
                  </div>
                  <div className='flex-column justify-content-center'>
                    <h3 className='mb-0 mt-0'>{t('filter.label.severity.potential')}</h3>
                  </div>
                </div>
                <div className='flex-column justify-content-end'>
                  <div className="errors-progress-bar">{t('summary.issues_resolved', {resolved: potentialCount.fixed, total: potentialCount.total})}</div>
                </div>
              </div>
              <ProgressBar progress={potentialCount.percent} />
              <div className="flex-row w-100 justify-content-between mt-2 gap-2">
                <div>{t('summary.potentials.description')}</div>
                <div className='flex-column justify-content-start flex-shrink-0'>
                  <button className="btn btn-primary" onClick={() => quickIssues('POTENTIAL')}>{t('summary.button.fix_potentials')}</button>
                </div>
              </div>
            </div>
            <div className='flex-column w-100'>
              <div className="flex-row w-100 justify-content-between mb-1">
                <div className='flex-row'>
                  <div className='flex-column justify-content-center mr-1'>
                  <SeverityIcon type="SUGGESTION" className='icon-lg' />
                  </div>
                  <div className='flex-column justify-content-center'>
                    <h3 className='mb-0 mt-0'>{t('filter.label.severity.suggestion')}</h3>
                  </div>
                </div>
                <div className='flex-column justify-content-end'>
                  <div className="errors-progress-bar">{t('summary.issues_resolved', {resolved: suggestionCount.fixed, total: suggestionCount.total})}</div>
                </div>
              </div>
              <ProgressBar progress={suggestionCount.percent} />
              <div className="flex-row w-100 justify-content-between mt-2 gap-2">
                <div>{t('summary.suggestions.description')}</div>
                <div className='flex-column justify-content-start flex-shrink-0'>
                  <button className="btn btn-primary" onClick={() => quickIssues('SUGGESTION')}>{t('summary.button.fix_suggestions')}</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex-column justify-content-end flex-grow-1">
        <DailyProgress  t={t} sessionIssues={sessionIssues} settings={settings} />
      </div>
    </div>
  </main>
  )
}