import React, { useState, useEffect } from "react";
import SortableTable from "../Widgets/SortableTable";
import Api from "../../Services/Api";
import SummaryIcon from "../Icons/SummaryIcon";
import ReportIcon from "../Icons/ReportIcon";

export default function CoursePage({
  t,
  instanceInfo,
  courses,
  searchTerm,
  handleReportClick,
  handleNavigation,
  addMessage,
}) {
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [tableSettings, setTableSettings] = useState({
    sortBy: "lastUpdated",
    ascending: false,
    pageNum: 0,
    rowsPerPage: localStorage.getItem("rowsPerPage")
      ? localStorage.getItem("rowsPerPage")
      : "10",
  });
  const headers = [
    {
      id: "courseName",
      text: t("report.header.course_name"),
      alignText: "center",
    },
    { id: "instructors", text: "Instructors", alignText: "center" },
    {
      id: "lastUpdated",
      text: t("report.header.last_scanned"),
      alignText: "center",
    },
    { id: "barriers", text: t("report.header.issues"), alignText: "center" },
    {
      id: "potentialBarriers",
      text: t("report.header.potential"),
      alignText: "center",
    },
    {
      id: "contentFixed",
      text: t("report.header.items_fixed"),
      alignText: "center",
    },
    {
      id: "contentResolved",
      text: t("report.header.items_resolved"),
      alignText: "center",
    },
    {
      id: "filesReviewed",
      text: t("report.header.files_reviewed"),
      alignText: "center",
    },
    { id: "action", text: "", alignText: "end" },
  ];

  useEffect(() => {
    let tempFilteredCourses = [];

    // Note: The `courses` variable is ALREADY filtered by the Account and Term.
    // This ONLY needs to filter based on the search term.
    courses.forEach((course) => {
      let excludeCourse = false;
      if (searchTerm !== "") {
        const searchTerms = searchTerm.toLowerCase().split(" ");
        let containsAllTerms = true;
        if (Array.isArray(searchTerms)) {
          for (let term of searchTerms) {
            if (!course.title.toLowerCase().includes(term)) {
              containsAllTerms = false;
            }
          }
        }
        if (!containsAllTerms) {
          excludeCourse = true;
        }
      }

      if (!excludeCourse) {
        // The Course data from the database is stored in the `course` object.
        // The data for the table is converted to the `row` object.
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
        const suggestions = scanCounts.suggestions || 0;
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
          courseTitle: course.title, // Used for sorting, not displayed outside of courseName element
          lastUpdated: course.lastUpdated || "---",
          barriers: hasReport && course.latestReport ? barriers : "---",
          potentialBarriers:
            hasReport && course.latestReport.scanCounts?.potentials
              ? course.latestReport.scanCounts.potentials
              : "---",
          contentFixed:
            hasReport && course.latestReport
              ? course.latestReport.contentFixed
              : "---",
          contentResolved:
            hasReport && course.latestReport
              ? course.latestReport.contentResolved
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
      }
    });

    const { sortBy, ascending } = tableSettings;

    tempFilteredCourses.sort((a, b) => {
      // ALWAYS sort UDOIT courses (with reports) first, then unscanned courses
      const aHasReport = a.course.hasReport;
      const bHasReport = b.course.hasReport;

      if (aHasReport && !bHasReport) return -1; // a (UDOIT) comes first
      if (!aHasReport && bHasReport) return 1; // b (UDOIT) comes first

      // If both have same report status, sort by selected column
      let comparison = 0;

      if (sortBy === "courseName") {
        comparison =
          a["courseTitle"].toLowerCase() < b["courseTitle"].toLowerCase()
            ? -1
            : 1;
      } else if (sortBy === "lastUpdated") {
        return new Date(a.lastUpdated) < new Date(b.lastUpdated) ? -1 : 1;
      } else {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        // Handle "---" values - treat them as lowest priority
        if (aVal === "---" && bVal === "---") {
          comparison = 0;
        } else if (aVal === "---") {
          comparison = 1;
        } else if (bVal === "---") {
          comparison = -1;
        } else if (!isNaN(aVal) && !isNaN(bVal)) {
          // Try numeric comparison first
          comparison = Number(aVal) < Number(bVal) ? -1 : 1;
        } else {
          // Fall back to string comparison
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          comparison = aStr < bStr ? -1 : 1;
        }
      }

      // Apply ascending/descending to the comparison (but NOT to the UDOIT vs unscanned grouping)
      return ascending ? comparison : -comparison;
    });

    setFilteredCourses(tempFilteredCourses);
  }, [courses, searchTerm, tableSettings]);

  const getCombinedCourse = () => {
    let combinedCourse = {};
    combinedCourse.allReports = [];
    combinedCourse.issues = [];
    combinedCourse.instructors = [];
    Object.values(courses).forEach((course) => {
      course?.allReports?.forEach((report) => {
        combinedCourse.allReports.push(report);
      });
      course?.issues?.forEach((issue) => {
        combinedCourse.issues.push(issue);
      });
    });
    combinedCourse.title = "All Courses";
    return combinedCourse;
  };

  const handleTableSettings = (newSettings) => {
    setTableSettings(Object.assign({}, tableSettings, newSettings));
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
            />
          </div>
          <div className="flex-row justify-content-end mt-3 mb-2">
            <button
              className="btn btn-primary flex-row justify-content-center"
              onClick={() => handleReportClick(getCombinedCourse())}
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
