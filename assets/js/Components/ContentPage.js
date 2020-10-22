import React from 'react';
import { Button } from '@instructure/ui-buttons'
import { IconCheckLine, IconInfoBorderlessLine, IconEndLine } from '@instructure/ui-icons'
import SortableTable from './SortableTable'
import ContentPageForm from './ContentPageForm'
import ContentTrayForm from './ContentTrayForm'
import { View } from '@instructure/ui-view'

class ContentPage extends React.Component {
  constructor(props) {
    super(props);

    this.filteredIssues = [];

    this.state = {
      activeIssue: null,
      trayOpen: false,
      searchTerm: '',
      filters: {
        contentTypes: [],
        hideUnpublishedContentItems: true,
        issueTypes: [],
        issueTitles: [],
        hideFixed: true,
      },
      tableSettings: {
        sortBy: 'scanRuleLabel',
        ascending: true,
        pageNum: 0,
      }
    }

    this.handleTrayToggle = this.handleTrayToggle.bind(this);
    this.handleSearchTerm = this.handleSearchTerm.bind(this);
    this.handleTableSettings = this.handleTableSettings.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
  }

  componentDidMount() {
    if (Object.keys(this.props.appFilters).length > 0) {
      const newFilters = Object.assign({}, this.resetFilters(), this.props.appFilters);
      this.props.handleAppFilters({});
      this.setState({ filters: newFilters });
    }
  }

  handleSearchTerm = (e, val) => {
    this.setState({searchTerm: val, filteredIssues: []});
  }

  handleTrayToggle = (e, val) => {
    this.setState({trayOpen: !this.state.trayOpen});
  }

  handleFilter = (filter) => {
    this.setState({
      filters: Object.assign({}, this.state.filters, filter),
      tableSettings: {
        sortBy: 'scanRuleLabel',
        ascending: true,
        pageNum: 0,
      }
    })
  }

  handleTableSettings = (setting) => {
    this.setState({
      tableSettings: Object.assign({}, this.state.tableSettings, setting)
    });
  }

  getContentById = (contentList, contentId) => {
    return Object.assign({}, contentList[contentId]);
  }

  getFilteredContent = () => {
    const report = this.props.report;
    const filters = this.state.filters;    
    
    var filteredList = [];
    var issueList = Object.assign({}, report.issues);
    
    // Loop through the issues
    issueLoop: for (const [key, value] of Object.entries(issueList)) {
      var issue = Object.assign({}, value)
      // Check if we are interested in this issue severity, aka "type"
      if (filters.issueTypes.length !== 0 && !filters.issueTypes.includes(issue.type)) {
        continue;
      }
  
      // Check if we are interested in issues with this rule title
      if (filters.issueTitles.length !== 0 && !filters.issueTitles.includes(issue.scanRuleId)) {
        continue;
      }

      // Check if we are showing fixed as well as not fixed
      if (filters.hideFixed && issue.status) {
        continue;
      }

      // Get information about the content the issue refers to
      var contentItem = this.getContentById(report.contentItems, issue.contentItemId);

      // Check if we are showing unpublished content items
      if (filters.hideUnpublishedContentItems && !contentItem.status) {
        continue;
      }

      // Check if we are filtering by content type
      if (filters.contentTypes.length !== 0 && !filters.contentTypes.includes(contentItem.contentType)) {
        continue;
      }

      // Filter by search term
      if (!issue.keywords) {
        issue.keywords = this.createKeywords(issue, contentItem);
      }
      if (this.state.searchTerm !== '') {
        const searchTerms = this.state.searchTerm.toLowerCase().split(' ');
        
        if (Array.isArray(searchTerms)) {
          for (let term of searchTerms) {
            if (!issue.keywords.includes(term)) {
              continue issueLoop;
            }
          }
        }
      }

      const status = (issue.status) ? <IconCheckLine color="success" /> : 
        ('error' === issue.type) ? <IconEndLine color="error" /> : <IconInfoBorderlessLine color="alert" />;

      filteredList.push(
        {
          status,
          scanRuleLabel: this.props.t(`rule.label.${issue.scanRuleId}`),
          contentType: this.props.t(`label.${contentItem.contentType}`),
          contentTitle: contentItem.title,
          action: <Button onClick={this.handleReviewClick} textAlign="center" >{this.props.t('label.review')}</Button>
        }
      );
    }

    return filteredList;
  }

  render() {
    const headers = [
      {id: "status", text: '', alignText: "center"},
      {id: "scanRuleLabel", text: this.props.t('label.issue')}, 
      {id: "contentType", text: this.props.t('label.content_type')}, 
      {id: "contentTitle", text: this.props.t('label.content_title')}, 
      {id: "action", text: "", alignText: "end"}
    ];
    const filteredIssues = this.getFilteredContent();

    return (
      <View as="div" key="contentPageFormWrapper">
        <ContentPageForm 
          handleSearchTerm={this.handleSearchTerm} 
          handleTrayToggle={this.handleTrayToggle} 
          searchTerm={this.state.searchTerm}
          t={this.props.t} />
        <SortableTable
          caption="Issue Table"
          headers = {headers}
          rows = {filteredIssues}
          filters = {this.state.filters}
          tableSettings = {this.state.tableSettings}
          handleFilter = {this.handleFilter}
          handleTableSettings = {this.handleTableSettings}
          key="contentTable" />
        <ContentTrayForm
          filters={this.state.filters}
          handleFilter={this.handleFilter}
          trayOpen={this.state.trayOpen}
          report={this.props.report}
          handleTrayToggle={this.handleTrayToggle} 
          t={this.props.t}
          key="contentTrayForm" />
      </View>
    )
  }

  createKeywords(issue, contentItem) {
    let keywords = [];

    keywords.push(this.props.t(`rule.label.${issue.scanRuleId}`).toLowerCase());
    keywords.push(this.props.t(`label.${contentItem.contentType}`).toLowerCase());
    keywords.push(contentItem.title.toLowerCase());

    return keywords.join(' ');
  }

  resetFilters() {
    return {
      contentTypes: [],
      hideUnpublishedContentItems: false,
      issueTypes: [],
      issueTitles: [],
      hideFixed: false,
    };
  }
}

export default ContentPage;