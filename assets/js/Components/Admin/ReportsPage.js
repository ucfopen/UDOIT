import React, { useState, useEffect } from 'react'
import Api from '../../Services/Api'

import ResolutionsReport from '../Reports/ResolutionsReport'
import ReportsTable from '../Reports/ReportsTable'
import IssuesTable from '../Reports/IssuesTable'
import ProgressIcon from '../Icons/ProgressIcon'
import '../ReportsPage.css'
import { analyzeReport } from '../../Services/Report'

export default function ReportsPage({
  t,
  settings,
  filters,
  selectedCourse
}) {
const [groupedReports, setGroupedReports] = useState(null)
const [issues, setIssues] = useState(null)
const [instructors, setInstructors] = useState([])

const ISSUE_STATE = {
  UNCHANGED: 0,
  SAVING: 1,
  RESOLVING: 2,
  SAVED: 3,
  RESOLVED: 4,
  ERROR: 5,
}

const getReportHistory = () => {
  const api = new Api(settings);
    api.getAdminReportHistory(filters)
      .then((responseStr) => responseStr.json())
      .then((response) => {
        if (!Array.isArray(response.data)) {

          const groupedReports = {}; // Initialize groupedReports
          // Iterate through each course
          Object.entries(response.data.reports).forEach(([courseName, courseDates]) => {
            groupedReports[courseName] = {}; // Initialize course in groupedReports
            
            // Iterate through each date in this course
            Object.entries(courseDates).forEach(([date, reportData]) => {
              const analyzedReport = analyzeReport(reportData, ISSUE_STATE);

              if (date.match(/^\d{4}-\d{2}-\d{2}$/) || date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                // Update groupedReports with the analyzed report
                groupedReports[courseName][date] = {
                  ...analyzedReport,
                };
              }
            });
          });

          // Update state with analyzed reports
          setGroupedReports(groupedReports);
          setIssues(response.data.issues);
          setInstructors(response.data.instructors || []);
        } else {
          setGroupedReports(null);
          setIssues(null);
          setInstructors([])
        }
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
      });
};

  useEffect(() => {
    if (groupedReports === null) {
      getReportHistory()
    }
  }, [])

  return (
    <div className="report-page-container scrollable">
      <div className="flex-row justify-content-center mt-3">
        <div className="flex-column w-100">
          <h1 className="mt-0 mb-0 primary-dark" style={{ textAlign: "center" }}>
            {selectedCourse?.title || t('report.header.all_courses')}
          </h1>
          <hr
            style={{
              margin: "8px auto 0 auto",
              borderTop: "1px solid",
              width: "90%"
            }}
          />
        </div>
      </div>

      {selectedCourse && (instructors?.length ?? 0) > 0 && (
        <div className="flex-row justify-content-center">
          <div className="mt-1 secondary-dark">
            {instructors.join(', ')}
          </div>
        </div>
      )}

      { (groupedReports === null) ? (
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
          {(groupedReports.length === 0) ? 
            <div className="flex-row justify-content-center mt-3">
              <div>{t('report.label.no_results')}</div>
            </div>
            : 
            <div className="flex-column">
              <div className="mt-4">
                <div id="resolutionsReport" className="graph-container">
                  <ResolutionsReport 
                    t={t} 
                    reports={groupedReports}
                    selectedCourse={selectedCourse}
                  />
                </div>
              </div>
              <div className="mt-3">
                <IssuesTable
                  t={t}
                  issues={issues}
                  isAdmin={true}
                  selectedCourse={selectedCourse}
                />
              </div>
              <div className="mt-3">
                <ReportsTable
                  t={t}
                  reports={groupedReports}
                  isAdmin={true}
                />
              </div>
            </div>
          }
        </div>
      )}
    </div>
  )
}
