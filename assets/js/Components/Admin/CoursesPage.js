import React, {useState, useEffect} from 'react'
import SortableTable from '../SortableTable'
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
    sortBy: 'errors',
    ascending: false,
    pageNum: 0,
    rowsPerPage: (localStorage.getItem('rowsPerPage')) ? localStorage.getItem('rowsPerPage') : '10'
  })
  
  const headers = [
    { id: "courseName", text: t('label.admin.course_name') }, 
    { id: "accountName", text: t('label.admin.account_name') }, 
    { id: "lastUpdated", text: t('label.admin.last_updated') },
    { id: "errors", text: t('label.plural.error') }, 
    { id: "suggestions", text: t('label.plural.suggestion') }, 
    { id: "contentFixed", text: t('label.content_fixed') }, 
    { id: "contentResolved", text: t('label.content_resolved') }, 
    { id: "filesReviewed", text: t('label.files_reviewed') }, 
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
        // The Course data from the database is stored in the `course` object.
        // The data for the table is converted to the `row` object.
        let row = {
          id: course.id,
          course,
          courseName: <a href={course.publicUrl} target="_blank" rel="noopener noreferrer">{course.title}</a>,
          courseTitle: course.title, // Used for sorting, not displayed outside of courseName element
          accountName: course.accountName,
          lastUpdated: course.lastUpdated,
          action: <div class="flex-row gap-1">
            <button key={`reportButton${course.id}`}
              onClick={() => { !course.loading && handleReportClick(course) }}
              textAlign="center"
              className={`btn-icon-only ${course.loading ? 'btn-disabled' : ''}`}
              disabled={course.loading}
              title={t('label.admin.reports')}
              aria-label={t('label.admin.reports')}
              >
                <ReportIcon className="icon-md" />
              </button>
            <button key={`scanButton${course.id}`}
              onClick={() => { !course.loading && handleScanClick(course) }}
              textAlign="center"
              className={`btn-icon-only ${course.loading ? 'btn-disabled' : ''}`}
              disabled={course.loading}
              title={t('label.admin.scan')}
              aria-label={t('label.admin.scan')}
              >
                <SummaryIcon className="icon-md" />
            </button>
          </div>
            
        }
        tempFilteredCourses.push({...row, ...course.report})
      }
    })

    const { sortBy, ascending } = tableSettings
    
    tempFilteredCourses.sort((a, b) => {
      if (sortBy === 'courseName') {
        return (a['courseTitle'].toLowerCase() < b['courseTitle'].toLowerCase()) ? -1 : 1
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
    <div className="pt-0 pe-0 pb-0 ps-0">
      <div className="flex-row justify-content-center mt-3 mb-2">
        <h1 className="mt-0 mb-0">{t('label.admin.courses')}</h1>
      </div>
      {(courses.length === 0 || filteredCourses.length === 0) ? 
        <div className="flex-column mt-3">
          <div className="flex-row justify-content-center">
            <h2 className="mt-0 mb-0">{t('label.no_results_header')}</h2>
          </div>
          <div className="flex-row justify-content-center mt-2">
            <div className="mt-0 mb-0">{t('label.no_results_message')}</div>
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
              onClick={() => handleNavigation('reports')}
            >
              <ReportIcon className="icon-md me-2" />
              <div className="flex-column justify-content-center">Get Report for All Courses</div>
            </button>
          </div>
        </>
      }
    </div>
  )
}