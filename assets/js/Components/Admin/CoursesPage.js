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
  const [isAnyScanning, setIsAnyScanning] = useState(false)
  const [tableSettings, setTableSettings] = useState({
    sortBy: 'lastUpdated',
    ascending: false,
    pageNum: 0,
    rowsPerPage: (localStorage.getItem('rowsPerPage')) ? localStorage.getItem('rowsPerPage') : '10'
  })
  const headers = [
    { id: "courseName", text: t('report.header.course_name'), alignText: "center" },
    { id: "instructors", text: "Instructors", alignText: "center" }, 
    { id: "accountName", text: t('report.header.account_name'), alignText: "center" }, 
    { id: "lastUpdated", text: t('report.header.last_scanned'), alignText: "center" },
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
        // The Course data from the database is stored in the `course` object.
        // The data for the table is converted to the `row` object.
        const names = Array.isArray(course.instructors) ? course.instructors : []
        const hasReport = course.hasReport || (course.report && course.report.id)
        const publicUrl = course.publicUrl !== '---' && course.publicUrl !== '-' ? course.publicUrl : null

        const scanCounts = course.report?.scanCounts || {};
        const barriers = scanCounts.errors || 0;
        const suggestions = scanCounts.suggestions || 0;
        let row = {
          id: course.id,
          course,
          courseName: publicUrl ? <a href={publicUrl} target="_blank" rel="noopener noreferrer">{course.title}</a> : course.title,
          instructors: names.length ? names.join(', ') : '---',
          courseTitle: course.title, // Used for sorting, not displayed outside of courseName element
          accountName: course.accountName || '---',
          lastUpdated: course.lastUpdated || '---',
          barriers: hasReport && course.report ? course.report.errors : '---',
          suggestions: hasReport && course.report ? course.report.suggestions : '---',
          contentFixed: hasReport && course.report ? course.report.contentFixed : '---',
          contentResolved: hasReport && course.report ? course.report.contentResolved : '---',
          filesReviewed: hasReport && course.report ? course.report.filesReviewed : '---',
          action: <div className="flex-row gap-1">
            <button key={`reportButton${course.id}`}
              onClick={() => { !course.loading && !isAnyScanning && hasReport && handleReportClick(course) }}
              textAlign="center"
              className={`btn btn-text btn-icon-only ${((course.loading || isAnyScanning) || !hasReport) ? 'btn-disabled' : ''}`}
              disabled={(course.loading || isAnyScanning) || !hasReport}
              title={hasReport ? t('report.button.view_report') : t('report.button.no_report')}
              aria-label={hasReport ? t('report.button.view_report') : t('report.button.no_report')}
              >
                <ReportIcon className="icon-md" />
              </button>
            <button key={`scanButton${course.id}`}
              onClick={() => { !course.loading && !isAnyScanning && handleScanClick(course) }}
              textAlign="center"
              className={`btn btn-text btn-icon-only ${(course.loading || isAnyScanning) ? 'btn-disabled' : ''}`}
              disabled={course.loading || isAnyScanning}
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
      // ALWAYS sort UDOIT courses (with reports) first, then unscanned courses
      const aHasReport = a.course.hasReport
      const bHasReport = b.course.hasReport
      
      if (aHasReport && !bHasReport) return -1  // a (UDOIT) comes first
      if (!aHasReport && bHasReport) return 1   // b (UDOIT) comes first
      
      // If both have same report status, sort by selected column
      let comparison = 0
      
      if (sortBy === 'courseName') {
        comparison = (a['courseTitle'].toLowerCase() < b['courseTitle'].toLowerCase()) ? -1 : 1
      } else if (sortBy === 'lastUpdated') {
        return new Date(a.lastUpdated) < new Date(b.lastUpdated) ? -1 : 1
      } else {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        
        // Handle "---" values - treat them as lowest priority
        if (aVal === '---' && bVal === '---') {
          comparison = 0
        } else if (aVal === '---') {
          comparison = 1
        } else if (bVal === '---') {
          comparison = -1
        } else if (!isNaN(aVal) && !isNaN(bVal)) {
          // Try numeric comparison first
          comparison = (Number(aVal) < Number(bVal)) ? -1 : 1
        } else {
          // Fall back to string comparison
          const aStr = String(aVal).toLowerCase()
          const bStr = String(bVal).toLowerCase()
          comparison = (aStr < bStr) ? -1 : 1
        }
      }
      
      // Apply ascending/descending to the comparison (but NOT to the UDOIT vs unscanned grouping)
      return ascending ? comparison : -comparison
    })

    setFilteredCourses(tempFilteredCourses)

  }, [courses, searchTerm, tableSettings])
  
  const handleTableSettings = (newSettings) => {
    setTableSettings(Object.assign({}, tableSettings, newSettings))
  }

  const handleScanClick = (course) => {
    let api = new Api(settings)
    setIsAnyScanning(true)
    
    // For unscanned courses, course.id will be the LMS course ID (string/number)
    // and hasReport will be false. We need to create the course in UDOIT first.
    // For scanned courses, course.id is the UDOIT database ID (number).
    const isUnscannedCourse = course.hasReport === false
    const originalCourseId = course.id // Keep track of original ID for updates
    
    if (isUnscannedCourse) {
      // For unscanned courses, first create the course in UDOIT database
      const lmsCourseId = course.lmsCourseId || course.id
      api.scanLmsCourse(lmsCourseId)
        .then((responseStr) => responseStr.json())
        .then((response) => {
          if (response.messages && response.messages.length > 0) {
            response.messages.forEach((msg) => {
              if (msg.visible) {
                addMessage(msg)
              }
            })
          }
          
          if (response.data && response.data.courseId) {
            // Update the course object with the new UDOIT ID and instructors
            course.udoitId = response.data.courseId
            const newCourseId = response.data.courseId
            
            // Update instructors if they were fetched
            if (Array.isArray(response.data.instructors)) {
              course.instructors = response.data.instructors.slice()
            }
            
            // Save the original ID for later removal after scan completes
            course.originalId = originalCourseId
            course.id = newCourseId  // Update the ID for future operations
            
            return api.scanCourse(newCourseId)
          } else {
            throw new Error('Failed to create course')
          }
        })
        .then((responseStr) => responseStr.json())
        .then((response) => {
          if (response.data) {
            if (Array.isArray(response.data.instructors)) {
              course.instructors = response.data.instructors.slice()
            }
            // Use the original ID for the update so it stays in the same position
            response.data.originalId = originalCourseId
            checkForReport(course)        
          }
          else {
            if (response.messages) {
              response.messages.forEach((msg) => {
                if (msg.visible) {
                  addMessage(msg)
                }
              })
            }
          }
        })
        .catch((error) => {
          console.error('Scan error:', error)
          addMessage({
            message: error.message || 'Failed to scan course',
            severity: 'error',
            timeout: 5000,
          })
          course.loading = false
          handleCourseUpdate(course)
          setIsAnyScanning(false)
        })
    } else {
      // For already scanned courses, use the UDOIT database ID
      const courseId = course.udoitId || course.id
      api.scanCourse(courseId)
        .then((responseStr) => responseStr.json())
        .then((response) => {
          if (response.data) {
            if (Array.isArray(response.data.instructors)) {
              course.instructors = response.data.instructors.slice()
            }
            checkForReport(course)        
          }
          else {
            if (response.messages) {
              response.messages.forEach((msg) => {
                if (msg.visible) {
                  addMessage(msg)
                }
              })
            }
          }
        })
        .catch((error) => {
          console.error('Scan error:', error)
          addMessage({
            message: error.message || 'Failed to scan course',
            severity: 'error',
            timeout: 5000,
          })
          course.loading = false
          handleCourseUpdate(course)
          setIsAnyScanning(false)
        })
    }
    
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
    const courseId = course.udoitId || course.id
    const originalId = course.originalId  // Save the original ID for removal

    var intervalId = setInterval(() => {
      api.getAdminReport(courseId)
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
            // Make sure hasReport is set to true after successful scan
            const updatedCourse = {
              ...data.data,
              hasReport: true,
              loading: false
            }
            
            // If this was a newly scanned course, signal to remove the old entry
            if (originalId && originalId !== data.data.id) {
              updatedCourse.oldId = originalId
            }
            
            handleCourseUpdate(updatedCourse)
            setIsAnyScanning(false)
          }
        })
    }, newReportInterval)
  }

  return (
    <div className="report-page-container scrollable">
      <div className="flex-row justify-content-center mt-3 mb-3">
        <h1 className="mt-0 mb-0 primary-dark">{t('report.header.courses')}</h1>
      </div>
      {(Object.keys(courses).length === 0 || filteredCourses.length === 0) ? 
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
          <div style={{overflowX: 'auto', overflowY: 'visible', flex: '1 1 auto'}}>
            <SortableTable
              t={t}
              caption=''
              headers = {headers}
              rows = {filteredCourses}
              tableSettings = {tableSettings}
              handleTableSettings = {handleTableSettings}
            />
          </div>
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