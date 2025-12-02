import React, {useState, useEffect} from 'react'
import SortableTable from '../Widgets/SortableTable'
import Api from '../../Services/Api'
import SummaryIcon from '../Icons/SummaryIcon'
import ReportIcon from '../Icons/ReportIcon'

export default function CoursePage({
  t,
  settings,
  courses,
  searchTerm,
  handleCourseUpdate,
  handleReportClick,
  handleNavigation,
  addMessage,
}) {

  const [filteredCourses, setFilteredCourses] = useState([])
  const [tableSettings, setTableSettings] = useState({
    sortBy: 'lastUpdated',
    ascending: false,
    pageNum: 0,
    rowsPerPage: (localStorage.getItem('rowsPerPage')) ? localStorage.getItem('rowsPerPage') : '10'
  })
  const headers = [
    { id: "courseName", text: t('report.header.course_name') }, 
    { id: "accountName", text: t('report.header.account_name') }, 
    { id: "lastUpdated", text: t('report.header.last_scanned') },
    { id: "barriers", text: t('report.header.issues'), alignText: "center" }, 
    { id: "suggestions", text: t('report.header.suggestions'), alignText: "center" }, 
    { id: "contentFixed", text: t('report.header.items_fixed'), alignText: "center" }, 
    { id: "contentResolved", text: t('report.header.items_resolved'), alignText: "center" }, 
    { id: "filesReviewed", text: t('report.header.files_reviewed'), alignText: "center" }, 
    { id: "action", text: "", alignText: "end" }
  ]

  useEffect(() => {
    let tempFilteredCourses = []

    // Note: The `courses` variable is ALREADY filtered by the Account and Term.
    // This ONLY needs to filter based on the search term.
    Object.keys(courses).forEach((key) => {
      const course = courses[key]
      let excludeCourse = false
      if (searchTerm !== '') {
        const searchTerms = searchTerm.toLowerCase().split(' ');
        let containsAllTerms = true
        if (Array.isArray(searchTerms)) {
          for (let term of searchTerms) {
            if (!course.title.toLowerCase().includes(term)) {
              containsAllTerms = false
            }
          }
        }
        if (!containsAllTerms) {
          excludeCourse = true
        }
      }

      if (!excludeCourse) {
        const scanCounts = course.report?.scanCounts || {};
        const barriers = scanCounts.errors || 0;
        const suggestions = scanCounts.suggestions || 0;
        let row = {
          id: course.id,
          course,
          courseName: <a href={course.publicUrl} target="_blank" rel="noopener noreferrer">{course.title}</a>,
          courseTitle: course.title, // Used for sorting, not displayed outside of courseName element
          accountName: course.accountName,
          barriers,
          suggestions,
          lastUpdated: course.lastUpdated,
          
          action: <div class="flex-row gap-1">
            <button key={`reportButton${course.id}`}
              onClick={() => { !course.loading && handleReportClick(course) }}
              textAlign="center"
              className={`btn btn-text btn-icon-only ${course.loading ? 'btn-disabled' : ''}`}
              disabled={course.loading}
              title={t('report.button.view_report')}
              aria-label={t('report.button.view_report')}
              >
                <ReportIcon className="icon-md" />
              </button>
            <button key={`scanButton${course.id}`}
              onClick={() => { !course.loading && handleScanClick(course) }}
              textAlign="center"
              className={`btn btn-text btn-icon-only ${course.loading ? 'btn-disabled' : ''}`}
              disabled={course.loading}
              title={t('report.button.scan')}
              aria-label={t('report.button.scan')}
              >
                <SummaryIcon className="icon-md" />
            </button>
          </div>
            
        }
        tempFilteredCourses.push({...course.report, ...row,})
      }
    })

    const { sortBy, ascending } = tableSettings
    
    tempFilteredCourses.sort((a, b) => {
      if (sortBy === 'courseName') {
        return (a['courseTitle'].toLowerCase() < b['courseTitle'].toLowerCase()) ? -1 : 1
      }
      if (sortBy === 'lastUpdated') {
        return new Date(a.lastUpdated) < new Date(b.lastUpdated) ? -1 : 1
      }
      if (isNaN(a[sortBy]) || isNaN(b[sortBy])) {
        return (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) ? -1 : 1
      }
      else {
        return (Number(a[sortBy]) < Number(b[sortBy])) ? -1 : 1
      }
    })

    if (!ascending) {
      tempFilteredCourses.reverse();
    }
    setFilteredCourses(tempFilteredCourses)

  }, [courses, searchTerm, tableSettings])
  
  const handleTableSettings = (newSettings) => {
    setTableSettings(Object.assign({}, tableSettings, newSettings))
  }

  const handleScanClick = (course) => {
    let api = new Api(settings)
    
    api.scanCourse(course.id)
      .then((responseStr) => responseStr.json())
      .then((response) => {
        if (response.data) {
          checkForReport(course)        
        }
        else {
          if (response.messages) {
            response.messages.forEach((msg) => {
              if (msg.visible) {
                addMessage(msg)
                handleCourseUpdate(course)
              }
            })
          }
        }
      })
    
    addMessage({
      message: 'msg.sync.started',
      severity: 'info',
      timeout: 5000,
    })

    course.loading = true
    handleCourseUpdate(course)
  }

  const checkForReport = (course) => {
    const newReportInterval = 5000
    let api = new Api(settings)

    var intervalId = setInterval(() => {
      api.getAdminReport(course.id)
        .then((response) => response.json())
        .then((data) => {
          if (data.messages) {
            data.messages.forEach((msg) => {
              if (msg.visible) {
                addMessage(msg)
              }
            })
          }

          if (data.data && data.data.id) {
            clearInterval(intervalId)
            handleCourseUpdate(data.data)
          }
        })
    }, newReportInterval)
  }

  return (
    <div className="report-page-container scrollable">
      <div className="flex-row justify-content-center mt-3 mb-3">
        <h1 className="mt-0 mb-0 primary-dark">{t('report.header.courses')}</h1>
      </div>
      {(courses.length === 0 || filteredCourses.length === 0) ? 
        <div className="flex-column mt-3">
          <div className="flex-row justify-content-center">
            <h2 className="mt-0 mb-0">{t('report.label.no_results')}</h2>
          </div>
          <div className="flex-row justify-content-center mt-2">
            <div className="mt-0 mb-0">{t('report.msg.no_results')}</div>
          </div>
        </div>
        :
        <>
          <SortableTable
            t={t}
            caption=''
            headers = {headers}
            rows = {filteredCourses}
            tableSettings = {tableSettings}
            handleTableSettings = {handleTableSettings}
          />
          <div className="flex-row justify-content-end mt-3 mb-2">
            <button
              className="btn btn-primary flex-row justify-content-center"
              onClick={() => handleReportClick(null)}
            >
              <ReportIcon className="icon-md me-2" />
              <div className="flex-column justify-content-center">{t('report.button.view_all_report')}</div>
            </button>
          </div>
        </>
      }
    </div>
  )
}