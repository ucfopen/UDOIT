import React from "react";
import ProgressBarCard from "../Widgets/ProgressBarCard";
import "../HomePage.css";
import ResolutionsReport from "../Reports/ResolutionsReport";
import DashboardCourseTable from "../Widgets/DashboardCourseTable";

export default function AdminDashboard({ t, dashboardStats }) {
  if (dashboardStats.loading) {
    return <div className="p-3">Loading dashboard...</div>;
  }

  const scanPercentage =
    dashboardStats.totalCourses > 0
      ? (dashboardStats.scannedCourses / dashboardStats.totalCourses) * 100
      : 0;

  const instructorAdoption =
    dashboardStats.totalInstructors > 0
      ? (dashboardStats.uniqueInstructorsUsingUdoit /
          dashboardStats.totalInstructors) *
        100
      : 0;

  return (
    <div className="report-page-container scrollable">
        <DashboardCourseTable t={t} courses={dashboardStats.showcaseCourses} />      
    </div>
  );
}