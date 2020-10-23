import React from 'react';
import classes from '../../css/contentPage.scss';
import { TextInput } from '@instructure/ui-text-input'
import { Checkbox } from '@instructure/ui-checkbox'
import SortableTable from './SortableTable'

class ContentPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notFixedErrorsOnly: false,
      textInputValue: "",
      filteredIssues: [],
      activeIssue: null
    }
  }

  componentDidMount() {
    this.setState({
      filteredIssues: this.getFilteredContent(this.props.report, this.props.filters)
    })
  }

  toggleFixedErrorsFilter = () => {
    // Modify visibility filters
    let visibilityFilters = Object.assign({}, this.props.filters);
    
    if(this.state.notFixedErrorsOnly === false) {
      visibilityFilters.status = ["Not Fixed"]
    } else {
      visibilityFilters.status = "SHOW_ALL"
    }

    this.props.handleFilters(visibilityFilters);
  }

  handleTextChange = (e) => {
    // Modify visibility filters
    let visibilityFilters = this.props.filters;
    visibilityFilters.search_term = e.target.value;
    
    // // Set search term filter
    // this.props.handleFilters(visibilityFilters);
    console.log(e.target.value);
  };

  getContentById = (contentList, contentId) => {
    return Object.assign({}, contentList[contentId]);
  }

  getFilteredContent = (report, filters) => {
    var filteredList = [];
    var issueList = Object.assign({}, report.data.issues);
    
    // Loop through the issues
    for (const [key, value] of Object.entries(issueList)) {
        var issue = Object.assign({}, value)
        // Check if we are interested in this issue severity, aka "type"
        if(filters.issueTypes === "SHOW_ALL" || filters.issueTypes.includes(issue.type)) {
            // Check if we are interested in issues with this title
            if(filters.issueTitles === "SHOW_ALL" || filters.issueTitles.includes(issue.scanRuleId)) {
                // Check if we are interested in the issue based on whether it is fixed or not
                issue.status = (issue.status === false ? "Not Fixed" : "Fixed")
                if(filters.status === "SHOW_ALL" || filters.status.includes(issue.status)){
                    // Get information about the content the issue refers to
                    var contentPiece = this.getContentById(report.data.contentItems, issue.contentItemId);

                    // Check if we are interesteed in this piece of content
                    if(filters.content === "SHOW_ALL" || filters.content.includes(contentPiece.title)) {
                        // Check if we are interested in this type of content
                        if(filters.sections === "SHOW_ALL" || filters.sections.includes(contentPiece.contentType)) {
                            issue.contentTitle = contentPiece.title;
                            issue.contentType = contentPiece.contentType
                            filteredList.push(issue);
                        }
                    }
                }
            }

        }
    }

    return filteredList;
  }

  render() {
    const headers = [{id: "status", text: "Status"},{id: "scanRuleId", text: "Issue"}, {id: "contentType", text: "Content Type"}, {id: "contentTitle", text: "Content Title"}, {id: "type", text: "Severity"}];
    return (
      <div>
        <div className={`${classes.summaryContainer}`}>
          <div className={`${classes.row}`}>
            <TextInput
            renderLabel="Search"
            placeholder="Keyword"
            onChange={this.handleTextChange}>
              
            </TextInput>

            <Checkbox label="Hide fixed issues" value="small" variant="toggle" size="small" onChange={this.toggleFixedErrorsFilter}/>
          </div>

          <br></br>

          <div className={`${classes.row}`}>
            <SortableTable
            caption="Filtered content"
            headers = {headers}
            rows = {this.state.filteredIssues}
            >
            </SortableTable>
          </div>
        </div>
      </div>
    )
  }
}


export default ContentPage;