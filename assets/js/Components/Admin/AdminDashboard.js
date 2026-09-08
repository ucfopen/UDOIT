import React, { useEffect, useState } from "react";
import DashboardCourseTable from "../Widgets/DashboardCourseTable";
import ProgressCircleCard from "../Widgets/ProgressCircleCard";
import ProgressBarsCard from "../Widgets/ProgressBarsCard";
import DashboardScanRuleTable from "../Widgets/DashboardScanRuleTable";
import { formNameFromRule } from "../../Services/Ufixit";


export default function AdminDashboard({ t, dashboardStats }) {
  const [scanRuleRanked, setScanRuleRanked] = useState([])

  useEffect(() => {
    if(dashboardStats?.scanRanked){
      const tempRanked = []
      for(const k in dashboardStats.scanRanked){
        if(k){ 
          tempRanked.push({
            rawRule: k,
            normalizedRule: t(`form.${formNameFromRule(k)}.title`),
            count: dashboardStats.scanRanked[k]
          })
        }
      }
      const sorted = tempRanked.sort((a,b) => b.count - a.count)
      for (const rule in sorted){
        sorted[rule].rank = Number(rule) + 1;
      }
      setScanRuleRanked(sorted)
    }
  }, [dashboardStats])


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

  const barrierProgressBars = [
    {
      label: "Issues Resolved",
      value: dashboardStats.issueFixCount,
      total: (dashboardStats.issueCount || 0) + (dashboardStats.issueFixCount || 0),
      type: "issue",
    },
    {
      label: "Potential Issues Resolved",
      value: dashboardStats.potentialIssueFixCount,
      total: (dashboardStats.potentialIssueCount || 0) + (dashboardStats.potentialIssueFixCount || 0),
      type: "potential",
    },
    {
      label: "Files Reviewed",
      value: dashboardStats.fileReviewCount,
      total: (dashboardStats.fileCount || 0) + (dashboardStats.fileReviewCount || 0),
      type: "file",
    },
  ]

  return (
    <div className="">
      <div className="admin-dashboard-stats-grid mt-3">
          <ProgressCircleCard
            title="Courses using UDOIT"
            percent={scanPercentage}
            caption={`${dashboardStats.scannedCourses} of ${dashboardStats.totalCourses} courses`}
            className="admin-dashboard-stat-card"/>
          <ProgressCircleCard
            title="Instructor adoption of UDOIT"
            percent={instructorAdoption}
            caption={`${dashboardStats.uniqueInstructorsUsingUdoit} of ${dashboardStats.totalInstructors} instructors`}
            className="admin-dashboard-stat-card"/>
          <ProgressBarsCard
            title="Barrier Progress"
            bars={barrierProgressBars}
            className="admin-dashboard-stat-card"/>
        </div>
        <div className="mt-4">
            <DashboardCourseTable t={t} courses={dashboardStats.showcaseCourses} />
        </div>
        <div className="mt-4">
           <DashboardScanRuleTable t={t} scanRuleRanked={scanRuleRanked} />
        </div>
    </div>
  );
} 
