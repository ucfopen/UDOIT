import React, {useState, useEffect} from 'react'
import SortableTable from '../SortableTable'
import Api from '../../Services/Api'

export default function CoursePage({
  t,
  settings,
  courses,
  searchTerm,
  handleCourseUpdate,
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
          action: <button key={`reviewButton${course.id}`}
            onClick={() => { !course.loading && handleScanClick(course) }}
            textAlign="center"
            className={`btn-icon-left btn-text${course.loading ? 'btn-disabled' : ''}`}
            disabled={course.loading}
            >{t('label.admin.scan')}</button>
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
    <div key="coursesPageFormWrapper" className="pt-0 pe-0 pb-0 ps-0">
      {(filteredCourses.length === 0) ? 
        <div>{t('label.admin.no_results')}</div>
        : 
        <SortableTable
          t={t}
          caption={t('srlabel.courses.table')}
          headers = {headers}
          rows = {filteredCourses}
          tableSettings = {tableSettings}
          handleTableSettings = {handleTableSettings}
        />        
      }
    </div>
  )
}

// class CoursesPage extends React.Component {
//   constructor(props) {
//     super(props);

//     this.headers = [
//       { id: "courseName", text: this.props.t('label.admin.course_name') }, 
//       { id: "accountName", text: this.props.t('label.admin.account_name') }, 
//       { id: "lastUpdated", text: this.props.t('label.admin.last_updated') },
//       { id: "errors", text: this.props.t('label.plural.error') }, 
//       { id: "suggestions", text: this.props.t('label.plural.suggestion') }, 
//       { id: "contentFixed", text: this.props.t('label.content_fixed') }, 
//       { id: "contentResolved", text: this.props.t('label.content_resolved') }, 
//       { id: "filesReviewed", text: this.props.t('label.files_reviewed') }, 
//       { id: "action", text: "", alignText: "end" }
//     ];

//     this.filteredIssues = [];

//     this.state = {
//       searchTerm: '',
//       tableSettings: {
//         sortBy: 'courseName',
//         ascending: true,
//         pageNum: 0,
//         rowsPerPage: (localStorage.getItem('rowsPerPage')) ? localStorage.getItem('rowsPerPage') : '10'
//       }
//     }

//     this.handleTableSettings = this.handleTableSettings.bind(this);
//     this.handleFilter = this.handleFilter.bind(this);
//     this.handleCourseLink = this.handleCourseLink.bind(this)
//   }

//   getFilteredContent() {
//     const { searchTerm } = this.state
//     const { sortBy, ascending } = this.state.tableSettings 
//     const courses = Object.values(this.props.courses)
//     const { filters } = this.props

//     let filteredList = [];

//     for (const course of courses) {
//       if (!course.report) {
//         continue
//       }

//       if (!filters.includeSubaccounts && (filters.accountId != course.accountId)) {
//         continue
//       }
      
//       // Filter by search term
//       if (searchTerm !== '') {
//         if (course.title.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
//           continue
//         }
//       }

//       const link = <Link 
//         onClick={() => this.handleCourseLink(course)} 
//         isWithinText={false}
//         >{course.title}</Link>

//       let row = {
//         id: course.id,
//         course,
//         courseName: link,
//         courseTitle: course.title,
//         lastUpdated: course.lastUpdated,
//         accountName: course.accountName,
//         action: <Button key={`reviewButton${course.id}`}
//           onClick={() => this.handleScanClick(course)}
//           textAlign="center" 
//           interaction={(course.loading) ? 'disabled' : 'enabled'}
//           renderIcon={(course.loading) ? <Spinner renderTitle="Scanning" size="x-small" /> : null}
//           >{this.props.t('label.admin.scan')}</Button>
//       }
//       filteredList.push({...row, ...course.report})    
//     }

//     filteredList.sort((a, b) => {
//       if (sortBy === 'courseName') {
//         return (a['courseTitle'].toLowerCase() < b['courseTitle'].toLowerCase()) ? -1 : 1
//       }
//       if (isNaN(a[sortBy]) || isNaN(b[sortBy])) {
//         return (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) ? -1 : 1
//       }
//       else {
//         return (Number(a[sortBy]) < Number(b[sortBy])) ? -1 : 1
//       }
//     })

//     if (!ascending) {
//       filteredList.reverse();
//     }

//     return filteredList;
//   }

//   render() {
//     const filteredRows = this.getFilteredContent();

//     return (
//       <View as="div" key="coursesPageFormWrapper" padding="small 0">
//         <ContentPageForm 
//           handleSearchTerm={this.handleSearchTerm} 
//           handleTrayToggle={this.props.handleTrayToggle} 
//           searchTerm={this.state.searchTerm}
//           t={this.props.t}
//           handleTableSettings={this.handleTableSettings}
//           tableSettings={this.state.tableSettings}
//           />
//         <View as="div" key="filterTags">
//           {this.props.renderFilterTags()}
//         </View>
//         {(filteredRows.length === 0) ? 
//           <View as="div">{this.props.t('label.admin.no_results')}</View>
//           : 
//           <SortableTable
//             caption={this.props.t('srlabel.courses.table')}
//             headers = {this.headers}
//             rows = {filteredRows}
//             //filters = {this.props.filters}
//             tableSettings = {this.state.tableSettings}
//             // handleFilter = {this.handleFilter}
//             handleTableSettings = {this.handleTableSettings}
//             t={this.props.t}
//           />        
//         }
//       </View>
//     )
//   }

//   handleSearchTerm = (e, val) => {
//     this.setState({searchTerm: val, tableSettings: Object.assign({}, this.state.tableSettings, {pageNum: 0})});
//   }

//   handleFilter = (filter) => {
//     this.setState({
//       filters: Object.assign({}, this.props.filters, filter),
//       tableSettings: {
//         sortBy: 'courseName',
//         ascending: true,
//         pageNum: 0,
//       },
//     })
//   }

//   handleTableSettings = (setting) => {
//     this.setState({
//       tableSettings: Object.assign({}, this.state.tableSettings, setting)
//     });
//   } 

//   handleScanClick(course) {
//     let api = new Api(this.props.settings)
    
//     api.scanCourse(course.id)
//       .then((responseStr) => responseStr.json())
//       .then((response) => {
//         if (response.data) {
//           this.checkForReport(course)        
//         }
//         else {
//           if (response.messages) {
//             response.messages.forEach((msg) => {
//               if (msg.visible) {
//                 this.props.addMessage(msg)
//                 this.props.handleCourseUpdate(course)
//               }
//             })
//           }
//         }
//       })
    
//     this.props.addMessage({
//       message: 'msg.sync.started',
//       severity: 'info',
//       timeout: 5000,
//     })

//     course.loading = true
//     this.props.handleCourseUpdate(course)
//   }

//   checkForReport(course) {
//     const newReportInterval = 5000
//     let api = new Api(this.props.settings)

//     var intervalId = setInterval(() => {
//       api.getAdminReport(course.id)
//         .then((response) => response.json())
//         .then((data) => {
//           if (data.messages) {
//             data.messages.forEach((msg) => {
//               if (msg.visible) {
//                 this.props.addMessage(msg)
//               }
//             })
//           }

//           if (data.data && data.data.id) {
//             clearInterval(intervalId)
//             this.props.handleCourseUpdate(data.data)
//           }
//         })
//     }, newReportInterval)
//   }

//   handleCourseLink(course) {
//     window.open(course.publicUrl, '_blank', 'noopener,noreferrer')
//   }
// }

// export default CoursesPage;