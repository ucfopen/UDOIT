import React, { useEffect, useState } from "react";
import DashboardCourseTable from "../Widgets/DashboardCourseTable";
import ProgressCircleCard from "../Widgets/ProgressCircleCard";
import ProgressBarsCard from "../Widgets/ProgressBarsCard";
import DashboardScanRuleTable from "../Widgets/DashboardScanRuleTable";
import InfoPopover from "../Widgets/InfoPopover";
import { formNameFromRule } from "../../Services/Ufixit";


export default function AdminDashboard({ t, dashboardStats, handleReportClick }) {
  const [scanRuleRanked, setScanRuleRanked] = useState([])

  useEffect(() => {
    if(dashboardStats?.scanRanked){
      const tempRanked = []
      for(const rule in dashboardStats.scanRanked){
        if(rule){ 
          const formName = formNameFromRule(rule);
          const label = formName === "review_only"
            ? t("report.label.unhandled") + rule
            : t(`form.${formName}.title`);

          tempRanked.push({
            normalizedRule: (
              <span className="issue-label">
                {label}
                <InfoPopover
                  t={t}
                  content={t(`form.${formName}.summary`)}
                />
              </span>
            ),
            normalizedRule_display: label,
            count: dashboardStats.scanRanked[rule]
          })
        }
      }
      const sorted = tempRanked.sort((a,b) => b.count - a.count)
      for (const index in sorted){
        sorted[index].rank = Number(index) + 1;
      }
      setScanRuleRanked(sorted)
    }
  }, [dashboardStats, t])


  if (dashboardStats.loading) {
    return <div className="p-3">{t("admin.status.loading_dashboard")}</div>;
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

  const barrierProgressBars = [
    {
      label: t("admin.dashboard.issues_resolved"),
      value: dashboardStats.issueFixCount,
      total: (dashboardStats.issueCount || 0) + (dashboardStats.issueFixCount || 0),
      type: "issue",
    },
    {
      label: t("admin.dashboard.potential_issues_resolved"),
      value: dashboardStats.potentialIssueFixCount,
      total: (dashboardStats.potentialIssueCount || 0) + (dashboardStats.potentialIssueFixCount || 0),
      type: "potential",
    },
    {
      label: t("admin.dashboard.files_reviewed"),
      value: dashboardStats.fileReviewCount,
      total: (dashboardStats.fileCount || 0) + (dashboardStats.fileReviewCount || 0),
      type: "file",
    },
  ]

  return (
    <div className="scrollable p-2 m-2">
      <div className="admin-dashboard-stats-grid mt-3">
          <ProgressCircleCard
            title={t("admin.dashboard.courses_using_udoit")}
            percent={scanPercentage}
            caption={t("admin.dashboard.courses_caption", {scanned: dashboardStats.scannedCourses, total: dashboardStats.totalCourses})}
            className="admin-dashboard-stat-card"/>
          <ProgressCircleCard
            title={t("admin.dashboard.instructor_adoption")}
            percent={instructorAdoption}
            caption={t("admin.dashboard.instructors_caption", {adopted: dashboardStats.uniqueInstructorsUsingUdoit, total: dashboardStats.totalInstructors})}
            className="admin-dashboard-stat-card"/>
          <ProgressBarsCard
            title={t("admin.dashboard.barrier_progress")}
            bars={barrierProgressBars}
            className="admin-dashboard-stat-card"/>
        </div>
        <div className="mt-4">
            <DashboardCourseTable
              t={t}
              courses={dashboardStats.showcaseCourses}
              handleReportClick={handleReportClick}
            />
        </div>
        <div className="mt-4">
           <DashboardScanRuleTable t={t} scanRuleRanked={scanRuleRanked} />
        </div>
    </div>
  );
} 
