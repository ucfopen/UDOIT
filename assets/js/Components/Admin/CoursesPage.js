import React, { useState, useEffect } from "react";
import SortableTable from "../Widgets/SortableTable";
import { api } from "../../Services/Api";
import SummaryIcon from "../Icons/SummaryIcon";
import ReportIcon from "../Icons/ReportIcon";

export default function CoursePage({
  t,
  courses,
  tableSettings,
  handleTableSettings,
  pagination,
  handleReportClick,
  fetchReportsIssues,
}) {
  const [filteredCourses, setFilteredCourses] = useState([]);
  const headers = [
    {
      id: "courseName",
      text: t("report.header.course_name"),
      alignText: "center",
    },
    { id: "instructors", text: "Instructors", alignText: "center", sortable: false },
    {
      id: "lastUpdated",
      text: t("report.header.last_scanned"),
      alignText: "center",
    },
    { id: "barriers", text: t("report.header.issues"), alignText: "center", sortable: false },
    {
      id: "potentialBarriers",
      text: t("report.header.potential"),
      alignText: "center",
      sortable: false,
    },
    {
      id: "issuesFixed",
      text: t("report.header.items_fixed"),
      alignText: "center",
      sortable: false,
    },
    {
      id: "issuesReviewed",
      text: t("report.header.items_resolved"),
      alignText: "center",
      sortable: false,
    },
    {
      id: "reviewedFiles",
      text: t("report.header.files_reviewed"),
      alignText: "center",
      sortable: false,
    },
    { id: "action", text: "", alignText: "end" },
  ];

  useEffect(() => {
    let tempFilteredCourses = [];

    courses.forEach((course) => {
      const names = Array.isArray(course.instructors)
        ? course.instructors
        : [];
      const hasReport =
        course.hasReport || (course.latestReport && course.latestReport.id);
      const publicUrl =
        course.publicUrl !== "---" && course.publicUrl !== "-"
          ? course.publicUrl
          : null;
      const scanCounts = course.latestReport?.scanCounts || {};
      const barriers = scanCounts.errors || 0;
      let row = {
        id: course.id,
        course,
        courseName: publicUrl ? (
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            {course.title}
          </a>
        ) : (
          course.title
        ),
        instructors: names.length ? names.join(", ") : "---",
        courseTitle: course.title,
        lastUpdated: course.lastUpdated || "---",
        barriers: hasReport && course.latestReport ? course.latestReport.issues : "---",
        potentialBarriers:
          hasReport && course.latestReport
            ? course.latestReport.potentialIssues
            : "---",
        contentFixed:
          hasReport && course.latestReport
            ? course.latestReport.issuesFixed + course.latestReport.potentialIssuesFixed
            : "---",
        contentResolved:
          hasReport && course.latestReport
            ? course.latestReport.issuesReviewed + course.latestReport.potentialIssuesReviewed
            : "---",
        filesReviewed:
          hasReport && course.latestReport
            ? course.latestReport.filesReviewed
            : "---",
        action: (
          <div className="flex-row gap-1">
            <button
              key={`reportButton${course.id}`}
              onClick={() => {
                hasReport && handleReportClick(course);
              }}
              textalign="center"
              className={`btn btn-text btn-icon-only ${!hasReport ? "btn-disabled" : ""}`}
              disabled={!hasReport}
              title={
                hasReport
                  ? t("report.button.view_report")
                  : t("report.button.no_report")
              }
              aria-label={
                hasReport
                  ? t("report.button.view_report")
                  : t("report.button.no_report")
              }
            >
              <ReportIcon className="icon-md" />
            </button>
          </div>
        ),
      };
      tempFilteredCourses.push({ ...course.latestReport, ...row });
    });

    setFilteredCourses(tempFilteredCourses);
  }, [courses]);

  const getCombinedCourse = async () => {
    const reportIssues = await fetchReportsIssues();
    console.log(reportIssues)

    return {
      title: "All Courses",
      instructors: [],
      allReports: reportIssues?.reports?.flat() ?? [],
      issues: reportIssues?.issues?.flat() ?? [],
    };
  };

  return (
    <div className="report-page-container scrollable">
      <div className="flex-row justify-content-center mt-3 mb-3">
        <h1 className="mt-0 mb-0 primary-dark">{t("report.header.courses")}</h1>
      </div>
      {courses?.length === 0 || filteredCourses?.length === 0 ? (
        <div className="flex-column mt-3">
          <div className="flex-row justify-content-center">
            <h2 className="mt-0 mb-0">{t("report.label.no_results")}</h2>
          </div>
          <div className="flex-row justify-content-center mt-2">
            <div className="mt-0 mb-0">{t("report.msg.no_results")}</div>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              overflowX: "auto",
              overflowY: "visible",
              flex: "1 1 auto",
            }}
          >
            <SortableTable
              t={t}
              caption=""
              headers={headers}
              rows={filteredCourses}
              tableSettings={tableSettings}
              handleTableSettings={handleTableSettings}
              totalRows={pagination?.total || 0}
              serverSidePagination={true}
            />
          </div>
          <div className="flex-row justify-content-end mt-3 mb-2">
            <button
              className="btn btn-primary flex-row justify-content-center"
              onClick={async () => {
                const combinedCourse = await getCombinedCourse();
                handleReportClick(combinedCourse);
              }}
            >
              <ReportIcon className="icon-md me-2" />
              <div className="flex-column justify-content-center">
                {t("report.button.view_all_report")}
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
