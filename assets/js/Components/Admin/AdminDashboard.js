import React, { useState, useEffect } from "react";
import ProgressCircle from "../Widgets/ProgressCircle";
import "../HomePage.css";

export default function AdminDashboard({ t, preferences, dashboardStats }) {

  const progressMeterRadius = () => {
    switch (preferences.fontSize) {
      case "font-small":
        return 40;
      case "font-normal":
        return 45;
      case "font-large":
        return 50;
      case "font-xlarge":
        return 60;
      default:
        return 40;
    }
  };


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
    <>
      <div className="flex-row gap-3 w-100 scrollable">
        <div className="flex-column gap-3 w-100">
          <section className="callout-container">
            <div className="flex-column">
              <div className="flex-row justify-content-evenly gap-3">
                <div className="flex-column">
                  <h2 className="callout-heading align-self-center text-center mt-1">
                    Course Usage
                  </h2>
                  <div className="svg-container align-self-center">
                    <ProgressCircle
                      percent={scanPercentage}
                      radius={progressMeterRadius()}
                      circlePortion={75}
                      strokeWidth={10}
                    />
                    <div className="progress-text-container flex-column justify-content-center text-center">
                      <div className="progress-text">
                        {scanPercentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex-row align-self-center count-summary">
                    {dashboardStats.scannedCourses} of{" "}
                    {dashboardStats.totalCourses} Courses Scanned
                  </div>
                </div>

                <div className="flex-column">
                  <h2 className="callout-heading align-self-center text-center mt-1">
                    Instructor Usage
                  </h2>
                  <div className="svg-container align-self-center">
                    <ProgressCircle
                      percent={instructorAdoption}
                      radius={progressMeterRadius()}
                      circlePortion={75}
                      strokeWidth={10}
                    />
                    <div className="progress-text-container flex-column justify-content-center text-center">
                      <div className="progress-text">
                        {instructorAdoption.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex-row align-self-center count-summary">
                    {dashboardStats.uniqueInstructorsUsingUdoit} of{" "}
                    {dashboardStats.totalInstructors} Instructors Using UDOIT
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
