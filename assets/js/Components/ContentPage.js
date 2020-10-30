import React from 'react';
import { Button } from '@instructure/ui-buttons'
import { IconCheckLine, IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'
import SortableTable from './SortableTable'
import ContentPageForm from './ContentPageForm'
import ContentTrayForm from './ContentTrayForm'
import { View } from '@instructure/ui-view'
import { Tag } from '@instructure/ui-tag'
import UfixitModal from './UfixitModal';
import Ufixit from '../Services/UFIXIT';

class ContentPage extends React.Component {
  constructor(props) {
    super(props);

    this.filteredIssues = [];

    this.state = {
      activeIssue: null,
      trayOpen: false,
      modalOpen: false,
      activeIndex: 0,
      searchTerm: '',
      filters: {
        contentTypes: [],
        issueTypes: [],
        issueTitles: [],
        hideFixed: true,
        hideUnpublishedContentItems: true,
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
    this.handleIssueChange = this.handleIssueChange.bind(this);
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

  // Opens the modal with the appropriate form based on the issue passed in
  handleReviewButton = (activeIssue, activeIndex) => {
    this.setState({
      modalOpen: true,
      activeIssue: activeIssue,
      activeIndex: activeIndex
    })
  }

  handleCloseButton = () => {
    this.setState({
      modalOpen: false
    })
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

  // Handler for the previous and next buttons on the modal
  // Will wrap around if the index goes out of bounds
  handleissueChange = (index, direction, issues) => {
    let issueLength = issues.length;

    if(direction === "previous") {
      let newIndex = index - 1;
      if(newIndex < 0) {
        newIndex = issueLength - 1;
      }

    } else if(direction === "next") {
      let newIndex = index + 1;

      if(newIndex > (issueLength - 1)) {
        newIndex = 0;
      }
    }

    this.setState({
      activeIssue: Object.assign({}, issues[newIndex])
    })
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
        ('error' === issue.type) ? <IconNoLine color="error" /> : <IconInfoBorderlessLine color="alert" />;

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
    const UfixitService = new Ufixit();

    return (
      <View as="div" key="contentPageFormWrapper">
        <ContentPageForm 
          handleSearchTerm={this.handleSearchTerm} 
          handleTrayToggle={this.handleTrayToggle} 
          searchTerm={this.state.searchTerm}
          t={this.props.t} />
        <View as="div" key="filterTags">
          {this.renderFilterTags()}
        </View>
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
        <UfixitModal
          open={this.state.modalOpen}
          activeIssue={this.state.activeIssue}
          index={this.state.activeIndex}
          ufixitService={UfixitService}
          totalCount={this.state.filteredIssues.length}
          handleCloseButton={this.handleCloseButton}
          />
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

  renderFilterTags() {
    let tags = [];

    for (const contentType of this.state.filters.contentTypes) {
      //let label = this.props.t('label.content_type') + ': ' + this.props.t(`label.plural.${id}`);
      const id = `contentTypes||${contentType}`;
      tags.push({ id: id, label: this.props.t(`label.plural.${contentType}`)});
    }

    for (const issueType of this.state.filters.issueTypes) {
      const id = `issueTypes||${issueType}`
      tags.push({ id: id, label: this.props.t(`label.plural.${issueType}`)});
    }

    for (const ruleId of this.state.filters.issueTitles) {
      const id = `issueTitles||${ruleId}`
      tags.push({ id: id, label: this.props.t(`rule.label.${ruleId}`) });
    }

    if (this.state.filters.hideFixed) {
      tags.push({ id: `hideFixed||true`, label: this.props.t(`label.hide_fixed`)});
    }
    if (this.state.filters.hideUnpublishedContentItems) {
      tags.push({ id: `hideUnpublishedContentItems||true`, label: this.props.t(`label.hide_unpublished`) });
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
      case 'contentTypes':
        results = this.state.filters.contentTypes.filter((val) => filterId !== val);
        break;
      case 'issueTypes':
        results = this.state.filters.issueTypes.filter((val) => filterId !== val);
        break;
      case 'issueTitles':
        results = this.state.filters.issueTitles.filter((val) => filterId !== val);
        break;
      case 'hideFixed':
        results = false;
        break;
      case 'hideUnpublishedContentItems':
        results = false;
        break;
    }

    this.handleFilter({ [filterType]: results });
  }
}

export default ContentPage;