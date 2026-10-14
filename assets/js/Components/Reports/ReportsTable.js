import React, { useState, useEffect } from "react";
import SortableTable from "../Widgets/SortableTable";

export default function ReportsTable({ t, reports }) {
  const headers = [
    { id: "created", text: t("report.header.date") },
    {
      id: "knownBarriers",
      text: t("report.header.issues"),
      alignText: "center",
    },
    {
      id: "potentialBarriers",
      text: t("report.header.potential"),
      alignText: "center",
    },
    {
      id: "filesUnreviewed",
      text: t("report.header.files_unreviewed"),
      alignText: "center",
      divider: true,
    },
    {
      id: "contentHandled",
      text: t("report.header.items_handled"),
      alignText: "center",
    },
    {
      id: "reviewedFiles",
      text: t("report.header.files_reviewed"),
      alignText: "center",
    },
  ];

  const [tableSettings, setTableSettings] = useState({
    sortBy: "created",
    ascending: false,
    pageNum: 0,
  });
  const [rows, setRows] = useState([]);

  // Helper function to get the latest report for each course
  const getLatestReports = (reports) => {
    if (!reports) return [];

    const latestReports = [];

    // Iterate through each course
    Object.entries(reports).forEach(([courseName, courseReports]) => {
      // Find the latest date for the course
      const latestDate = Object.keys(courseReports).sort(
        (a, b) => new Date(b) - new Date(a),
      )[0];
      const latestReport = courseReports[latestDate];

      // Add the latest report to the list
      latestReports.push({
        courseName,
        created: latestDate,
        issues: latestReport.issues || 0,
        potentialIssues: latestReport.potentialIssues || 0,
        unreviewedFiles: latestReport.unreviewedFiles || 0,
        issuesFixed: latestReport.issuesFixed || 0,
        issuesReviewed: latestReport.issuesReviewed || 0,
        potentialIssuesFixed: latestReport.potentialIssuesFixed || 0,
        potentialIssuesReviewed: latestReport.potentialIssuesReviewed || 0,
        reviewedFiles: latestReport.reviewedFiles || 0,
      });
    });

    return latestReports;
  };

  const getContent = () => {
    let list = [];
    if (reports && reports.length > 0) {
      if (reports[0].courseName) {
        list = getLatestReports(reports); // Preprocess reports to get the latest entry per course
      } else {
        list = reports; // If reports are already in the expected format, use them directly
      }
    }

    if (!list) {
      return [];
    }

    list = list.map((report) => {
      if (report.scanCounts) {
        report.knownBarriers = report.scanCounts.errors || 0;
        report.potentialBarriers = report.scanCounts.potentials;
        report.filesUnreviewed = report.scanCounts.files || 0;
      } else {
        report.knownBarriers = report.issues || 0;
        report.potentialBarriers = report.potentialIssues || 0;
        report.filesUnreviewed = report.unreviewedFiles || 0;
      }
      report.contentHandled = report.scanCounts?.resolved ||
        (report.issuesFixed || 0) +
        (report.issuesReviewed || 0) +
        (report.potentialIssuesFixed || 0) +
        (report.potentialIssuesReviewed || 0)
      return report
    })
    const { sortBy, ascending } = tableSettings

    list.sort((a, b) => {
      if (isNaN(a[sortBy]) || isNaN(b[sortBy])) {
        return a[sortBy].toLowerCase() < b[sortBy].toLowerCase() ? -1 : 1;
      } else {
        return Number(a[sortBy]) < Number(b[sortBy]) ? -1 : 1;
      }
    });

    if (!ascending) {
      list.reverse();
    }

    return list;
  };

  const handleTableSettings = (setting) => {
    setTableSettings(Object.assign({}, tableSettings, setting));
  };

  useEffect(() => {
    setRows(getContent());
  }, [tableSettings, reports]);

  return (
    <SortableTable
      caption={t("report.title.barriers_remaining")}
      headers={headers}
      rows={getContent()}
      tableSettings={tableSettings}
      handleTableSettings={handleTableSettings}
      t={t}
    />
  );
}
