import React, { useState, useEffect } from "react";

import ResolutionsReport from "../Reports/ResolutionsReport";
import ReportsTable from "../Reports/ReportsTable";
import IssuesTable from "../Reports/IssuesTable";
import { formNameFromRule } from "../../Services/Ufixit";
import StatusPill from "../Widgets/StatusPill";
import ProgressIcon from "../Icons/ProgressIcon";
import "../ReportsPage.css";
import { ISSUE_FILTER } from "../../Services/Constants";

export default function ReportsPage({
  t,
  instanceInfo,
  filters,
  selectedCourse,
}) {
  const [groupedReports, setGroupedReports] = useState(null);
  const [selectedCourseReports, setSelectedCourseReports] = useState(null);
  const [issues, setIssues] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const ALL_COURSES_TITLE = t("report.header.all_courses")

  const getReportHistory = () => {
    if (selectedCourse.title == ALL_COURSES_TITLE) {
      setGroupedReports(normalizeResolutionReportsForAllCourses())
    }
    else{
        setGroupedReports(normalizeResolutionReports());
    }
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
        issues: report.issues,
        potentialIssues: report.potentialIssues,
        unreviewedFiles: report.unreviewedFiles,
      };
    }

    return courseObject;
  };

  const normalizeResolutionReportsForAllCourses = () => {
    let reports = selectedCourse.allReports;
    const allDates = new Set()

    let courseObject = {};
    for (const report of reports){
      courseObject[report.courseId] = {}
    }
    
    for (const report of reports) {
      allDates.add(report.created)
      courseObject[report.courseId][report.created] = {
        issues: report.issues,
        potentialIssues: report.potentialIssues,
        unreviewedFiles: report.unreviewedFiles,
      };
    }

    
    const sortedDates = [...allDates].sort()
    let groupedReport = {}
    groupedReport[selectedCourse.title] = {}

    for(const d of sortedDates){
      groupedReport[selectedCourse.title][d] = {
        issues: 0,
        potentialIssues: 0,
        unreviewedFiles: 0
      }
    }

    console.log(courseObject)
    console.log(sortedDates)
    for(const course in courseObject){
        const earliestDate = Object.keys(courseObject[course]).sort()[0]
        const startingIndex = sortedDates.findIndex((d) => d == earliestDate)
        let latestDate = earliestDate;

        for(let i = startingIndex; i < sortedDates.length; i++){
          if (sortedDates[i] in courseObject[course]){
            groupedReport[selectedCourse.title][sortedDates[i]]["issues"] += courseObject[course][sortedDates[i]]["issues"]
            groupedReport[selectedCourse.title][sortedDates[i]]["potentialIssues"] += courseObject[course][sortedDates[i]]["potentialIssues"]
            groupedReport[selectedCourse.title][sortedDates[i]]["unreviewedFiles"] += courseObject[course][sortedDates[i]]["unreviewedFiles"]
            latestDate = sortedDates[i]
          }
          else{
            groupedReport[selectedCourse.title][sortedDates[i]]["issues"] += courseObject[course][latestDate]["issues"]
            groupedReport[selectedCourse.title][sortedDates[i]]["potentialIssues"] += courseObject[course][latestDate]["potentialIssues"]
            groupedReport[selectedCourse.title][sortedDates[i]]["unreviewedFiles"] += courseObject[course][latestDate]["unreviewedFiles"]
          }
        }

        for (let i = startingIndex - 1; i >= 0; i--){
            groupedReport[selectedCourse.title][sortedDates[i]]["issues"] += courseObject[course][earliestDate]["issues"]
            groupedReport[selectedCourse.title][sortedDates[i]]["potentialIssues"] += courseObject[course][earliestDate]["potentialIssues"]
            groupedReport[selectedCourse.title][sortedDates[i]]["unreviewedFiles"] += courseObject[course][earliestDate]["unreviewedFiles"]
        }
    }


    console.log(groupedReport)
    return groupedReport;
  }

  const normalizeIssues = () => {
    let rules = [];

    for (let issue of selectedCourse.issues) {
      const rule = issue.scanRuleId;
      const status = issue.status;

      if (!rules[rule]) {
        rules[rule] = {
          id: rule,
          type: issue.type,
          severity:
            issue.type === "error"
              ? t("filter.label.severity.issue")
              : t("filter.label.severity.potential"),
          active: 0,
          resolved: 0,
          total: 0,
        };
      }

      rules[rule]["total"]++;
      if (0 === status) {
        rules[rule]["active"]++;
      } else {
        rules[rule]["resolved"]++;
      }
    }

    let tempIssues = Object.values(rules);
    tempIssues.map((issue) => {
      let label = "";
      let formName = formNameFromRule(issue.id);
      if (formName === "review_only") {
        label = t("report.label.unhandled") + issue.id;
      } else {
        label = t(`form.${formName}.title`);
      }
      issue.display = label;
      issue.label = <span className="issue-label">{label}</span>;
      issue.label_display = label;
      issue.summary = t(`form.${formName}.summary`);
      return issue;
    });

    let mergedIssues = [];
    let labels = [];
    tempIssues.forEach((issue) => {
      if (!labels.includes(issue.label_display)) {
        labels.push(issue.label_display);
        if (issue.type === "error" || issue.type === "issue") {
          issue.type = (
            <StatusPill
              t={t}
              issue={{
                status: ISSUE_FILTER.ACTIVE,
                severity: ISSUE_FILTER.ISSUE,
              }}
            />
          );
          issue.type_display = t("filter.label.severity.issue");
        } else if (issue.type === "potential" || issue.type === "suggestion") {
          issue.type = (
            <StatusPill
              t={t}
              issue={{
                status: ISSUE_FILTER.ACTIVE,
                severity: ISSUE_FILTER.POTENTIAL,
              }}
            />
          );
          issue.type_display = t("filter.label.severity.potential");
        }
        mergedIssues.push(issue);
      } else {
        let index = mergedIssues.findIndex(
          (i) => i.label_display === issue.label_display
        );
        mergedIssues[index].total += issue.total;
        mergedIssues[index].active += issue.active;
        mergedIssues[index].resolved += issue.resolved;
      }
    });

    return mergedIssues;
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
