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
  sessionIssues,
  handleFullCourseRescan
}) {

  const [totalIssues, setTotalIssues] = useState(0)
  const [totalPotentialIssues, setTotalPotentialIssues] = useState(0)
  const [totalSuggestions, setTotalSuggestions] = useState(0)
  const [totalsCounted, setTotalsCounted] = useState(false)
  const [issuePercent, setIssuePercent] = useState(0)
  const [potentialPercent, setPotentialPercent] = useState(0)
  const [suggestionPercent, setSuggestionPercent] = useState(0)

  useEffect(() => {
    if (!hasNewReport) return

    let totalIssues = 0
    let totalPotentialIssues = 0
    let totalSuggestions = 0
    let totalIssuesFixed = 0
    let totalPotentialIssuesFixed = 0
    let totalSuggestionsFixed = 0

    if(report.issues && report.issues.length > 0) {
      for (const i of report.issues){
        if(i.type === 'error') {
          totalIssues += 1
          if (i.status === 1 || i.status === 2) {
            totalIssuesFixed += 1
          }
        }
        else if (i.type === 'potential'){
          totalPotentialIssues +=1
          if (i.status === 1 || i.status === 2) {
            totalPotentialIssuesFixed += 1
          }
        }
        else if (i.type === 'suggestion') {
          totalSuggestions +=1
          if (i.status === 1 || i.status === 2) {
            totalSuggestionsFixed += 1
          }
        }
      }
    }

    if (report.files) {
      for (const [key, fileData] of Object.entries(report.files)) {
        totalPotentialIssues += 1
        if (fileData.reviewed) {
          totalPotentialIssuesFixed += 1
        }
      }
    }

    // setstates once done iterating and adding, then use those states to display the totals.
    setTotalIssues(totalIssues)
    setTotalPotentialIssues(totalPotentialIssues)
    setTotalSuggestions(totalSuggestions)
    setIssuePercent(totalIssues === 0 ? 0 : (totalIssuesFixed/totalIssues) * 100)
    setPotentialPercent(totalPotentialIssues === 0 ? 0 : (totalPotentialIssuesFixed/totalPotentialIssues) * 100)
    setSuggestionPercent(totalSuggestions === 0 ? 0 : (totalSuggestionsFixed/totalSuggestions) * 100)

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
                  <div className="errors-progress-bar">{t('summary.issues_resolved', {resolved: issuePercent.toFixed(), total: totalIssues})}</div>
                </div>
              </div>
              <ProgressBar progress={issuePercent} />
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
                  <div className="errors-progress-bar">{t('summary.issues_resolved', {resolved: potentialPercent.toFixed(), total: totalPotentialIssues})}</div>
                </div>
              </div>
              <ProgressBar progress={potentialPercent} />
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
                  <div className="errors-progress-bar">{t('summary.issues_resolved', {resolved: suggestionPercent.toFixed(), total: totalSuggestions})}</div>
                </div>
              </div>
              <ProgressBar progress={suggestionPercent} />
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