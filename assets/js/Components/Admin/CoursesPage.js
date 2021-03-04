import React from 'react';
import { Button } from '@instructure/ui-buttons'
import { IconCheckLine, IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'
import SortableTable from '../SortableTable'
import ContentPageForm from '../ContentPageForm'
import AdminTrayForm from './AdminTrayForm'
import { View } from '@instructure/ui-view'
import { Tag } from '@instructure/ui-tag'
import Api from '../../Services/Api'
import { Link } from '@instructure/ui-link'
import { Spinner } from '@instructure/ui-spinner';

class CoursesPage extends React.Component {
  constructor(props) {
    super(props);

    this.headers = [
      { id: "courseName", text: this.props.t('label.admin.course_name') }, 
      { id: "accountName", text: this.props.t('label.admin.account_name') }, 
      { id: "lastUpdated", text: this.props.t('label.admin.last_updated') },
      { id: "errors", text: this.props.t('label.plural.error') }, 
      { id: "suggestions", text: this.props.t('label.plural.suggestion') }, 
      { id: "contentFixed", text: this.props.t('label.content_fixed') }, 
      { id: "contentResolved", text: this.props.t('label.content_resolved') }, 
      { id: "filesReviewed", text: this.props.t('label.files_reviewed') }, 
      { id: "action", text: "", alignText: "end" }
    ];

    this.filteredIssues = [];

    this.state = {
      trayOpen: false,
      searchTerm: '',
      filters: {
        subAccounts: [],
      },
      tableSettings: {
        sortBy: 'courseName',
        ascending: true,
        pageNum: 0,
      }
    }

    this.handleTrayToggle = this.handleTrayToggle.bind(this);
    this.handleSearchTerm = this.handleSearchTerm.bind(this);
    this.handleTableSettings = this.handleTableSettings.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleCourseLink = this.handleCourseLink.bind(this)
  }

  getFilteredContent() {
    const { filters, searchTerm } = this.state
    const { sortBy, ascending } = this.state.tableSettings 
    const courses = Object.values(this.props.courses)
    
    let filteredList = [];

    for (const course of courses) {
      if (!course.report) {
        continue
      }

      if (filters.subAccounts && filters.subAccounts.length > 0) {
        if (!filters.subAccounts.includes(course.accountId)) {
          continue
        }
      }
      
      // Filter by search term
      if (searchTerm !== '') {
        if (course.title.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
          continue
        }
      }

      const link = <Link 
        onClick={() => this.handleCourseLink(course)} 
        isWithinText={false}
        >{course.title}</Link>

      let row = {
        id: course.id,
        course,
        courseName: link,
        courseTitle: course.title,
        lastUpdated: course.lastUpdated,
        accountName: course.accountName,
        action: <Button key={`reviewButton${course.id}`}
          onClick={() => this.handleScanClick(course)}
          textAlign="center" 
          interaction={(course.loading) ? 'disabled' : 'enabled'}
          renderIcon={(course.loading) ? <Spinner renderTitle="Scanning" size="x-small" /> : null}
          >{this.props.t('label.admin.scan')}</Button>
      }
      filteredList.push({...row, ...course.report})    
    }

    filteredList.sort((a, b) => {
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
      filteredList.reverse();
    }

    return filteredList;
  }

  render() {
    const filteredRows = this.getFilteredContent();

    return (
      <View as="div" key="coursesPageFormWrapper" padding="small 0">
        <ContentPageForm 
          handleSearchTerm={this.handleSearchTerm} 
          handleTrayToggle={this.handleTrayToggle} 
          searchTerm={this.state.searchTerm}
          t={this.props.t} />
        <View as="div" key="filterTags">
          {this.renderFilterTags()}
        </View>
        <SortableTable
          caption="Courses Table"
          headers = {this.headers}
          rows = {filteredRows}
          filters = {this.state.filters}
          tableSettings = {this.state.tableSettings}
          handleFilter = {this.handleFilter}
          handleTableSettings = {this.handleTableSettings}
        />
        {this.state.trayOpen && <AdminTrayForm
          filters={this.state.filters}
          handleFilter={this.handleFilter}
          settings={this.props.settings}
          trayOpen={this.state.trayOpen}
          handleTrayToggle={this.handleTrayToggle} 
          t={this.props.t}
          />}        
      </View>
    )
  }

  resetFilters() {
    return {subAccounts:[]};
  }

  renderFilterTags() {
    let tags = [];

    const subAccounts = this.props.settings.account.subAccounts

    for (const subAccountId of this.state.filters.subAccounts) {
      if (subAccounts && subAccounts[subAccountId]) {
        const id = `subAccounts||${subAccountId}`
        tags.push({ id: id, label: subAccounts[subAccountId]})
      }
    }

    return tags.map((tag) => (
      <Tag margin="0 small small 0" 
        text={tag.label} 
        dismissible={true} 
        onClick={(e) => this.handleTagClick(tag.id, e)}
        key={tag.id} />
    ));
  }

  handleTagClick(tagId, e) {
    let [filterType, filterId] = tagId.split('||');
    let results = null;

    switch (filterType) {
      case 'subAccounts':
        results = this.state.filters.subAccounts.filter((val) => filterId !== val);
        break;
    }

    this.handleFilter({ [filterType]: results });
  }

  handleSearchTerm = (e, val) => {
    this.setState({ searchTerm: val });
  }

  handleTrayToggle = (e, val) => {
    this.setState({ trayOpen: !this.state.trayOpen });
  }

  handleFilter = (filter) => {
    this.setState({
      filters: Object.assign({}, this.state.filters, filter),
      tableSettings: {
        sortBy: 'courseName',
        ascending: true,
        pageNum: 0,
      },
    })
  }

  handleTableSettings = (setting) => {
    this.setState({
      tableSettings: Object.assign({}, this.state.tableSettings, setting)
    });
  } 

  handleScanClick(course) {
    let api = new Api(this.props.settings)
    
    api.scanCourse(course.id)
      .then((responseStr) => responseStr.json())
      .then((response) => {
        if (response.data) {
          this.checkForReport(course)        
        }
        else {
          if (response.messages) {
            response.messages.forEach((msg) => {
              if (msg.visible) {
                this.props.addMessage(msg)
                this.props.handleCourseUpdate(course)
              }
            })
          }
        }
      })
    
    this.props.addMessage({
      message: 'msg.sync.started',
      severity: 'info',
      timeout: 5000,
    })

    course.loading = true
    this.props.handleCourseUpdate(course)
  }

  checkForReport(course) {
    const newReportInterval = 5000
    let api = new Api(this.props.settings)

    var intervalId = setInterval(() => {
      api.getAdminReport(course.id)
        .then((response) => response.json())
        .then((data) => {
          if (data.messages) {
            data.messages.forEach((msg) => {
              if (msg.visible) {
                this.props.addMessage(msg)
              }
            })
          }

          if (data.data && data.data.id) {
            clearInterval(intervalId)
            this.props.handleCourseUpdate(data.data)
          }
        })
    }, newReportInterval)
  }

  handleCourseLink(course) {
    window.open(course.publicUrl, '_blank', 'noopener,noreferrer')
  }
}

export default CoursesPage;