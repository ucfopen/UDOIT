import React, { useState, useEffect } from 'react'

import Api from '../Services/Api'
import IssuesReport from './Reports/IssuesReport'
import ResolutionsReport from './Reports/ResolutionsReport'
import ReportsTable from './Reports/ReportsTable'
import IssuesTable from './Reports/IssuesTable'
import ProgressIcon from './Icons/ProgressIcon'

export default function ReportsPage({t, report, settings, quickSearchTerm}) {

  const [reports, setReports] = useState([])
  const [fetchedReports, setFetchedReports] = useState(false)
  const [issues, setIssues] = useState([])
  const [chartVisibility, setChartVisibility] = useState({
    issues: true,
    potentialIssues: true,
    suggestions: true
  })

  const getReportHistory = () => {
    const api = new Api(settings)
    api.getReportHistory()
      .then((responseStr) => responseStr.json())
      .then((response) => {
        setReports(response.data)
        setFetchedReports(true)
      })
  }

  const processIssues = (report) => {

    let rules = []

    for (let issue of report.issues) {
      const rule = issue.scanRuleId
      const status = issue.status
      
      if (!rules[rule]) {
        rules[rule] = {
          id: rule,
          type: issue.type,
          active: 0,
          fixed: 0,
          resolved: 0,
          total: 0
        }
      }

      if (2 === status) {
        rules[rule]['resolved']++
      }
      else if (1 === status) {
        rules[rule]['fixed']++
      }
      else {
        rules[rule]['active']++
      }
      rules[rule]['total']++
    }

    return rules
  }

  useEffect(() => {
    if (reports.length === 0) {
      getReportHistory()
    }
  }, [])

  useEffect(() => {
    setIssues(processIssues(report))
  }, [report])

  const toggleChartVisibility = (chart) => {
    const tempVisibility = Object.assign({}, chartVisibility, {[chart]: !chartVisibility[chart]})
    setChartVisibility(tempVisibility)
  }

  return (
    <main>
      <h1 className="primary-dark">{t('menu.reports')}</h1>
      { (!fetchedReports) && (
        <div className="mt-3 mb-3 flex-row justify-content-center">
          <div className="flex-column justify-content-center me-3">
            <ProgressIcon className="icon-lg udoit-suggestion spinner" />
          </div>
          <div className="flex-column justify-content-center">
            <h2 className="mt-0 mb-0">{t('report.label.loading_reports')}</h2>
          </div>
        </div>
      )}
      { (fetchedReports && reports.length === 0) && (
        <div className="flex-row justify-content-center mt-3">
          <h2 className="mt-0 mb-0">{t('report.label.no_results')}</h2>
        </div>
      )}

      { (fetchedReports && reports.length > 0) && (
        <div className="flex-column">
          <div className="flex-row justify-content-between gap-3">
            
            <div className="flex-column flex-shrink-0 flex-grow-1">
              <div className="flex-row justify-content-center">
                <h2 className="primary-dark mt-0 mb-3">{t('report.title.barriers_remaining')}</h2>
              </div>
              <ResolutionsReport t={t} reports={reports} visibility={chartVisibility} />
            </div>

            <div className="flex-column justify-content-start">
              <div className="callout-container">
                <h3 className="primary-dark mt-0">{t('report.title.options')}</h3>
                <div className="flex-row gap-1 mb-2">
                  <input 
                    type="checkbox" 
                    id="issuesToggle"
                    name="issuesToggle"
                    tabindex="0"
                    checked={chartVisibility.issues}
                    onChange={() => toggleChartVisibility('issues')}
                  />
                  <label htmlFor="issuesToggle">{t('report.option.show_issues')}</label>
                </div>
                <div className="flex-row gap-1 mb-2">
                  <input 
                    type="checkbox" 
                    id="potentialIssuesToggle"
                    name="potentialIssuesToggle"
                    tabindex="0"
                    checked={chartVisibility.potentialIssues} 
                    onChange={() => toggleChartVisibility('potentialIssues')}
                  />
                  <label htmlFor="potentialIssuesToggle">{t('report.option.show_potential')}</label>
                </div>
                <div className="flex-row gap-1">
                  <input 
                    type="checkbox" 
                    id="suggestionsToggle"
                    name="suggestionsToggle"
                    tabindex="0"
                    checked={chartVisibility.suggestions} 
                    onChange={() => toggleChartVisibility('suggestions')}
                  />
                  <label htmlFor="suggestionsToggle">{t('report.option.show_suggestions')}</label>
                </div>
              </div>
            </div>

          </div>
        
          <div className="mt-4">
            <IssuesTable
              t={t}
              settings={settings}
              quickSearchTerm={quickSearchTerm}
              issues={issues}/>
          </div>

          <div className="mt-4">
            <ReportsTable
              t={t}
              reports={reports}/>
          </div>

          {/* <div className="flex-row justify-content-end mt-3 mb-2 gap-2">
            <button className="btn btn-primary">{t('report.button.download')}</button>
            <button className="btn btn-primary">{t('report.button.print')}</button>
          </div> */}

        </div>
      )}
    </main>
  )
}