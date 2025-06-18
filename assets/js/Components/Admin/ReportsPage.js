import React, { useState, useEffect } from 'react'
import Api from '../../Services/Api'

import IssuesReport from '../Reports/IssuesReport'
import ResolutionsReport from '../Reports/ResolutionsReport'
import ReportsTable from '../Reports/ReportsTable'
import IssuesTable from '../Reports/IssuesTable'
import ProgressIcon from '../Icons/ProgressIcon'

export default function ReportsPage({
  t,
  settings,
  filters,
  selectedCourse
}) {

  const [reports, setReports] = useState(null)
  const [issues, setIssues] = useState(null)

  const getReportHistory = () => {
    const api = new Api(settings)
    if(selectedCourse === null) {
      api.getAdminReportHistory(filters)
        .then((responseStr) => responseStr.json())
        .then((response) => {
          if (!Array.isArray(response.data)) {
            let tempReports = Object.values(response.data.reports)
            for (let report of tempReports) {
              report.id = report.created
            }
            setReports(tempReports)
            setIssues(response.data.issues)
          }
          else {
            setReports(null)
            setIssues(null)
          }
          
        })
    }
    else {
      api.getCourseReport(selectedCourse.id)
        .then((responseStr) => responseStr.json())
        .then((response) => {
          if (response.data) {
            let tempReports = Object.values(response.data.reports)
            for (let report of tempReports) {
              report.id = report.created
            }
            setReports(tempReports)
            setIssues(response.data.issues)
          }
          else {
            setReports(null)
            setIssues(null)
          }
        })
    }

  }

  useEffect(() => {
    if (reports === null) {
      getReportHistory()
    }
  }, [])

  return (
    <>
    { (selectedCourse !== null) &&
      <div className="flex-row justify-content-center mt-3">
        <h1 className="mt-0 mb-0 primary-dark">{selectedCourse.title}</h1>
      </div>
    }
    { (reports === null) ? (
      <div className="mt-3 mb-3 flex-row justify-content-center">
        <div className="flex-column justify-content-center me-3">
          <ProgressIcon className="icon-lg udoit-suggestion spinner" />
        </div>
        <div className="flex-column justify-content-center">
          <h2 className="mt-0 mb-0">{t('report.label.loading_reports')}</h2>
        </div>
      </div>
    ) : (
      <div>
        {(reports.length === 0) ? 
          <div className="flex-row justify-content-center mt-3">
            <div>{t('report.label.no_results')}</div>
          </div>
          : 
          <div className="flex-column">
            <div className="flex-row flex-wrap justify-content-between mt-3 gap-3">
              <div className="w-100">
                <IssuesReport
                  t={t}
                  reports={reports}
                />
              </div>
              <div className="w-100">
                <ResolutionsReport
                  t={t}
                  reports={reports}
                />
              </div>
            </div>
            <div className="mt-3">
              <IssuesTable
                t={t}
                issues={issues}
                isAdmin={true}
              />
            </div>
            <div className="mt-3">
              <ReportsTable
                t={t}
                reports={reports}
                isAdmin={true}
              />
            </div>
          </div>
        }
      </div>
    )}
    </>
  )
}
