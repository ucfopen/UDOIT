import React, { useState, useEffect } from 'react'
import ProgressCircle from '../Widgets/ProgressCircle'
import '../HomePage.css'

export default function AdminDashboard({
  t,
  settings,
  courses
}) {
  const [dashboardStats, setDashboardStats] = useState({
    loading: true,
    totalCourses: 0,
    scannedCourses: 0,
    totalInstructors: 0,
    uniqueInstructorsUsingUdoit: 0,
    totalErrors: 0,
    totalSuggestions: 0,
    totalFixed: 0,
    totalResolved: 0,
    totalFilesReviewed: 0,
    recentScans: 0,
    accountBreakdown: {},
    oldestScan: null,
    newestScan: null
  })

  const progressMeterRadius = () => {
    switch (settings?.user?.roles?.font_size) {
      case 'font-small':
        return 40;
      case 'font-normal':
        return 45;
      case 'font-large':
        return 50;
      case 'font-xlarge':
        return 60;
      default:
        return 40;
    }
  }

  useEffect(() => {
    calculateStats()
  }, [courses])

  const calculateStats = () => {
    if (!courses || Object.keys(courses).length === 0) {
      setDashboardStats(prev => ({ ...prev, loading: false }))
      return
    }

    const stats = {
      loading: false,
      totalCourses: 0,
      scannedCourses: 0,
      totalInstructors: 0,
      uniqueInstructorsUsingUdoit: 0,
      totalErrors: 0,
      totalSuggestions: 0,
      totalFixed: 0,
      totalResolved: 0,
      totalFilesReviewed: 0,
      recentScans: 0,
      accountBreakdown: {},
      oldestScan: null,
      newestScan: null
    }

    const allInstructors = new Set()
    const udoitInstructors = new Set()
    const accountStats = {}
    const scanDates = []
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    Object.keys(courses).forEach(key => {
      const course = courses[key]
      stats.totalCourses++

      // Track instructors
      if (Array.isArray(course.instructors)) {
        course.instructors.forEach(instructor => {
          allInstructors.add(instructor)
          if (course.hasReport) {
            udoitInstructors.add(instructor)
          }
        })
      }

      // Account breakdown
      const accountName = course.accountName || 'Unknown'
      if (!accountStats[accountName]) {
        accountStats[accountName] = { total: 0, scanned: 0, errors: 0 }
      }
      accountStats[accountName].total++

      if (course.hasReport) {
        stats.scannedCourses++
        accountStats[accountName].scanned++

        // Aggregate report data
        if (course.report) {
          stats.totalErrors += parseInt(course.report.errors) || 0
          stats.totalSuggestions += parseInt(course.report.suggestions) || 0
          stats.totalFixed += parseInt(course.report.contentFixed) || 0
          stats.totalResolved += parseInt(course.report.contentResolved) || 0
          stats.totalFilesReviewed += parseInt(course.report.filesReviewed) || 0
          accountStats[accountName].errors += parseInt(course.report.errors) || 0
        }

        // Track scan dates
        if (course.lastUpdated && course.lastUpdated !== '---') {
          const scanDate = new Date(course.lastUpdated)
          scanDates.push(scanDate)
          
          if (scanDate > thirtyDaysAgo) {
            stats.recentScans++
          }
        }
      }
    })

    stats.totalInstructors = allInstructors.size
    stats.uniqueInstructorsUsingUdoit = udoitInstructors.size
    stats.accountBreakdown = accountStats
    stats.accountNumber = Object.keys(accountStats).length

    // Find oldest and newest scans
    if (scanDates.length > 0) {
      scanDates.sort((a, b) => a - b)
      stats.oldestScan = scanDates[0]
      stats.newestScan = scanDates[scanDates.length - 1]
    }

    setDashboardStats(stats)
  }

  if (dashboardStats.loading) {
    return <div className="p-3">Loading dashboard...</div>
  }

  const scanPercentage = dashboardStats.totalCourses > 0 
    ? ((dashboardStats.scannedCourses / dashboardStats.totalCourses) * 100)
    : 0

  const instructorAdoption = dashboardStats.totalInstructors > 0
    ? ((dashboardStats.uniqueInstructorsUsingUdoit / dashboardStats.totalInstructors) * 100)
    : 0

  return (
    <>
      <div className="flex-row gap-3 w-100 scrollable">
        
        <div className="flex-column gap-3 w-100">
          <section className="callout-container">
            <div className="flex-column">
              <div className="flex-row justify-content-evenly gap-3">
                <div className="flex-column">
                  <h2 className="callout-heading align-self-center text-center mt-1">Course Usage</h2>
                  <div className="svg-container align-self-center">
                    <ProgressCircle
                      percent={scanPercentage}
                      radius={progressMeterRadius()}
                      circlePortion={75}
                      strokeWidth={10}/>
                    <div className="progress-text-container flex-column justify-content-center">
                      <div className="progress-text">{scanPercentage.toFixed(0)}%</div>
                    </div>
                  </div>
                  <div className="flex-row align-self-center count-summary">{dashboardStats.scannedCourses} of {dashboardStats.totalCourses} Courses Scanned</div>
                </div>

                <div className="flex-column">
                  <h2 className="callout-heading align-self-center text-center mt-1">Instructor Usage</h2>
                  <div className="svg-container align-self-center">
                    <ProgressCircle
                      percent={instructorAdoption}
                      radius={progressMeterRadius()}
                      circlePortion={75}
                      strokeWidth={10}/>
                    <div className="progress-text-container flex-column justify-content-center">
                      <div className="progress-text">{instructorAdoption.toFixed(0)}%</div>
                    </div>
                  </div>
                  <div className="flex-row align-self-center count-summary">{dashboardStats.uniqueInstructorsUsingUdoit} of {dashboardStats.totalInstructors} Instructors Using UDOIT</div>
                </div>
              </div>

              <div className="separator mt-3 mb-3"></div>

              <div className="flex-column w-100 mb-2 gap-1">
                <p className="m-0"><span className="progress-text me-3">{dashboardStats.recentScans}</span> Courses Scanned in Last 30 Days</p>
                {dashboardStats.oldestScan && (<p className="m-0"><span className="progress-text me-3">{dashboardStats.oldestScan.toLocaleDateString()}</span> Oldest Scan</p>)}
                {dashboardStats.newestScan && (<p className="m-0"><span className="progress-text me-3">{dashboardStats.newestScan.toLocaleDateString()}</span> Most Recent Scan</p>)}
              </div>
            </div>

            {/* <h2>Course Statistics</h2>
            <p>Total Courses: {dashboardStats.totalCourses}</p>
            <p>Scanned Courses: {dashboardStats.scannedCourses}</p>
            <p>Unscanned Courses: {dashboardStats.totalCourses - dashboardStats.scannedCourses}</p>
            <p>Scan Adoption Rate: {scanPercentage}%</p>
            <p>Courses Scanned in Last 30 Days: {dashboardStats.recentScans}</p>

            <h2>Instructor Statistics</h2>
            <p>Total Instructors: {dashboardStats.totalInstructors}</p>
            <p>Instructors Using UDOIT: {dashboardStats.uniqueInstructorsUsingUdoit}</p>
            <p>Instructor Adoption Rate: {instructorAdoption}%</p>

            <h2>Accessibility Statistics</h2>
            <p>Total Accessibility Issues Found: {dashboardStats.totalErrors}</p>
            <p>Total Suggestions Made: {dashboardStats.totalSuggestions}</p>
            <p>Total Items Fixed: {dashboardStats.totalFixed}</p>
            <p>Total Items Resolved: {dashboardStats.totalResolved}</p>
            <p>Total Files Reviewed: {dashboardStats.totalFilesReviewed}</p> */}
          
          </section>

          <section className="callout-container">
            <p>Total Accessibility Issues Found: {dashboardStats.totalErrors}</p>
            <p>Total Suggestions Made: {dashboardStats.totalSuggestions}</p>
            <p>Total Items Fixed: {dashboardStats.totalFixed}</p>
            <p>Total Items Resolved: {dashboardStats.totalResolved}</p>
            <p>Total Files Reviewed: {dashboardStats.totalFilesReviewed}</p>
            {dashboardStats.scannedCourses > 0 && (
              <>
                <p>Average Issues per Scanned Course: {(dashboardStats.totalErrors / dashboardStats.scannedCourses).toFixed(1)}</p>
                <p>Average Files Reviewed per Course: {(dashboardStats.totalFilesReviewed / dashboardStats.scannedCourses).toFixed(1)}</p>
              </>
            )}
          </section>
        </div>

        {dashboardStats.accountNumber > 1 && (
          <section className="callout-container">
            <h2 className="callout-heading mt-1">Department/Account Breakdown</h2>
            {Object.entries(dashboardStats.accountBreakdown).map(([account, stats]) => (
              <div key={account}>
                <p><strong>{account}:</strong></p>
                <p style={{ marginLeft: '20px' }}>Total Courses: {stats.total}</p>
                <p style={{ marginLeft: '20px' }}>Scanned: {stats.scanned} ({stats.total > 0 ? ((stats.scanned / stats.total) * 100).toFixed(1) : 0}%)</p>
                <p style={{ marginLeft: '20px' }}>Total Issues: {stats.errors}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  )
}
