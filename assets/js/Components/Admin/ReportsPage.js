import React, { useState, useEffect } from "react";

import ResolutionsReport from "../Reports/ResolutionsReport";
import ReportsTable from "../Reports/ReportsTable";
import IssuesTable from "../Reports/IssuesTable";
import ProgressIcon from "../Icons/ProgressIcon";
import "../ReportsPage.css";

export default function ReportsPage({ t, settings, filters, selectedCourse }) {
  const [groupedReports, setGroupedReports] = useState(null);
  const [selectedCourseReports, setSelectedCourseReports] = useState(null);
  const [issues, setIssues] = useState(null);
  const [instructors, setInstructors] = useState([]);

  const ISSUE_STATE = {
    UNCHANGED: 0,
    SAVING: 1,
    RESOLVING: 2,
    SAVED: 3,
    RESOLVED: 4,
    ERROR: 5,
  };

  const getReportHistory = () => {
    setGroupedReports(normalizeResolutionReports());
    setSelectedCourseReports(selectedCourse.allReports);
    setIssues(normalizeIssues());
    setInstructors(selectedCourse.instructors || []);
  };

  const normalizeResolutionReports = () => {
    let reports = selectedCourse.allReports;

    let courseObject = {};
    courseObject[selectedCourse.title] = {};

    for (const report of reports) {
      courseObject[selectedCourse.title][report.created] = {
        scanCounts: report.scanCounts,
      };
    }

    return courseObject;
  };

  const normalizeIssues = () => {
    let issues = selectedCourse.issues;
    const grouped = issues.reduce((acc, issue) => {
      const { scanRuleId, type, status } = issue;

      if (!acc[scanRuleId]) {
        acc[scanRuleId] = {
          label: scanRuleId,
          type: type,
          active: 0,
          handled: 0,
          total: 0,
        };
      }

      acc[scanRuleId].total += 1;

      if (status === 0) {
        acc[scanRuleId].active += 1;
      } else if (status === 1 || status === 2) {
        acc[scanRuleId].handled += 1;
      }

      return acc;
    }, {});

    return Object.values(grouped);
  };

  useEffect(() => {
    if (groupedReports === null) {
      getReportHistory();
    }
  }, []);

  return (
    <div className="report-page-container scrollable">
      <div className="flex-row justify-content-center mt-3">
        <div className="flex-column w-100">
          <h1
            className="mt-0 mb-0 primary-dark"
            style={{ textAlign: "center" }}
          >
            {selectedCourse?.title || t("report.header.all_courses")}
          </h1>
          <hr
            style={{
              margin: "8px auto 0 auto",
              borderTop: "1px solid",
              width: "90%",
            }}
          />
        </div>
      </div>

      {selectedCourse && (instructors?.length ?? 0) > 0 && (
        <div className="flex-row justify-content-center">
          <div className="mt-1 secondary-dark">{instructors.join(", ")}</div>
        </div>
      )}

      {groupedReports === null ? (
        <div className="mt-3 mb-3 flex-row justify-content-center">
          <div className="flex-column justify-content-center me-3">
            <ProgressIcon className="icon-lg udoit-progress spinner" />
          </div>
          <div className="flex-column justify-content-center">
            <h2 className="mt-0 mb-0">{t("report.label.loading_reports")}</h2>
          </div>
        </div>
      ) : (
        <div>
          {groupedReports.length === 0 ? (
            <div className="flex-row justify-content-center mt-3">
              <div>{t("report.label.no_results")}</div>
            </div>
          ) : (
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
                <ReportsTable t={t} reports={selectedCourseReports} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
