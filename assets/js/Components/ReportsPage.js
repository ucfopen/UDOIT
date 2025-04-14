import React, { useState, useEffect } from 'react'

import Api from '../Services/Api'
import IssuesReport from './Reports/IssuesReport'
import ResolutionsReport from './Reports/ResolutionsReport'
import ReportsTable from './Reports/ReportsTable'
import IssuesTable from './Reports/IssuesTable'
import ProgressIcon from './Icons/ProgressIcon'

export default function ReportsPage({t, report, settings}) {

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
    <>
      <div className="flex-row justify-content-center mt-3">
        <h1 className="mt-0 mb-0">{t('label.reports')}</h1>
      </div>
      { (!fetchedReports) && (
        <div className="mt-3 mb-3 flex-row justify-content-center">
          <div className="flex-column justify-content-center me-3">
            <ProgressIcon className="icon-lg primary spinner" />
          </div>
          <div className="flex-column justify-content-center">
            <h2 className="mt-0 mb-0">{t('label.loading_reports')}</h2>
          </div>
        </div>
      )}
      { (fetchedReports && reports.length === 0) && (
        <div className="flex-row justify-content-center mt-3">
          <h2 className="mt-0 mb-0">{t('label.admin.no_results')}</h2>
        </div>
      )}

      { (fetchedReports && reports.length > 0) && (
        <div className="flex-column">
          <div className="flex-row justify-content-between mt-3 gap-3">
            <div className="flex-column flex-shrink-0 flex-grow-0">
              <h3 className="mt-0 mb-0">{t('label.options')}</h3>
              <div className="flex-row gap-3 mt-3">
                  <input 
                    type="checkbox" 
                    id="issuesToggle" 
                    checked={chartVisibility.issues}
                    onChange={() => toggleChartVisibility('issues')}
                  />
                  <label htmlFor="issuesToggle">{t('label.report.show_issues')}</label>
              </div>
              <div className="flex-row gap-3 mt-3">
                <input 
                  type="checkbox" 
                  id="potentialIssuesToggle" 
                  checked={chartVisibility.potentialIssues} 
                  onChange={() => toggleChartVisibility('potentialIssues')}
                />
                <label htmlFor="potentialIssuesToggle">{t('label.report.show_potential')}</label>
              </div>
              <div className="flex-row gap-3 mt-3">
                <input 
                  type="checkbox" 
                  id="suggestionsToggle" 
                  checked={chartVisibility.suggestions} 
                  onChange={() => toggleChartVisibility('suggestions')}
                />
                <label htmlFor="suggestionsToggle">{t('label.report.show_suggestions')}</label>
              </div>
            </div>
            <div className="flex-column flex-shrink-0 flex-grow-1">
              <h2 className="mt-0 mb-3">{t('label.plural.resolution')}</h2>
              <ResolutionsReport t={t} reports={reports} visibility={chartVisibility} />
            </div>
          </div>
        
          <div className="mt-3">
            <IssuesTable
              t={t}
              settings={settings}
              issues={issues}/>
          </div>

          <div className="mt-3">
            <ReportsTable
              t={t}
              reports={reports}/>
          </div>

          <div className="flex-row justify-content-end mt-3 mb-2 gap-2">
            <button className="btn-primary">Export Report</button>
            <button className="btn-primary">Print Report</button>
          </div>

        </div>
      )}
    </>
  )
}