import React from "react";
import ProgressBarCard from "../Widgets/ProgressBarCard";
import "../HomePage.css";

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
    <div className="admin-dashboard-stats-grid">
      <ProgressBarCard
        title={t("Courses Scanned")}
        percent={scanPercentage}
        caption={`${dashboardStats.scannedCourses} of ${dashboardStats.totalCourses} courses scanned`}
      />
      <ProgressBarCard
        title={t("Instructor Adoption")}
        percent={instructorAdoption}
        caption={`${dashboardStats.uniqueInstructorsUsingUdoit} of ${dashboardStats.totalInstructors} instructors using UDOIT`}
      />
    </div>
  );
}
