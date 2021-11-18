import React from 'react';
import { Button } from '@instructure/ui-buttons'
import { IconCheckLine, IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'
import { Billboard } from '@instructure/ui-billboard'
import SortableTable from './SortableTable'
import ContentPageForm from './ContentPageForm'
import ContentTrayForm from './ContentTrayForm'
import { View } from '@instructure/ui-view'
import { Tag } from '@instructure/ui-tag'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import UfixitModal from './UfixitModal'
import Classes from '../../css/theme-overrides.scss'
import { issueRuleIds } from './Constants'

const issueStatusKeys = [
  'active',
  'fixed',
  'resolved'
]

class ContentPage extends React.Component {
  constructor(props) {
    super(props);

    this.filteredIssues = [];
    this.headers = [
      {id: "status", text: '', alignText: "center"},
      { id: "contentTitle", text: this.props.t('label.header.title') },
      { id: "contentType", text: this.props.t('label.header.type') },
      { id: "scanRuleLabel", text: this.props.t('label.issue') },
      {id: "action", text: "", alignText: "end"}
    ]

    this.easyRules = issueRuleIds.filter(rule => this.props.settings.easyRuleIds.includes(rule))

    this.visualRules = issueRuleIds.filter(rule => this.props.settings.visualRuleIds.includes(rule))
    this.auditoryRules = issueRuleIds.filter(rule => this.props.settings.auditoryRuleIds.includes(rule))
    this.cognitiveRules = issueRuleIds.filter(rule => this.props.settings.cognitiveRuleIds.includes(rule))
    this.motorRules = issueRuleIds.filter(rule => this.props.settings.motorRuleIds.includes(rule))

    this.state = {
      activeIssue: null,
      trayOpen: false,
      modalOpen: false,
      activeIndex: -1,
      searchTerm: '',
      filters: {
        contentTypes: [],
        issueTypes: [],
        issueTitles: [],
        issueStatus: ['active'],
        issueImpacts: [],
        hideUnpublishedContentItems: false,
        easyIssues: false,
      },
      tableSettings: {
        sortBy: 'contentTitle',
        ascending: true,
        pageNum: 0,
        rowsPerPage: (localStorage.getItem('rowsPerPage')) ? localStorage.getItem('rowsPerPage') : '10'
      },
    };

    this.handleTrayToggle = this.handleTrayToggle.bind(this);
    this.handleSearchTerm = this.handleSearchTerm.bind(this);
    this.handleTableSettings = this.handleTableSettings.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleActiveIssue = this.handleActiveIssue.bind(this);
    //this.handleIssueSave = this.handleIssueSave.bind(this)
  }

  componentDidMount() {
    if (Object.keys(this.props.appFilters).length > 0) {
      const newFilters = Object.assign({}, this.resetFilters(), this.props.appFilters);
      this.props.handleAppFilters({});
      this.setState({ filters: newFilters });
    }
  }

  static getDerivedStateFromProps(props, state) {
    const stateActiveIssue = state.activeIssue
    const propsActiveIssue = stateActiveIssue && props.report.issues[stateActiveIssue.id]
    if(propsActiveIssue && propsActiveIssue.status !== stateActiveIssue.status) {
      return {
        activeIssue: propsActiveIssue
      }
    }
    return null
  }

  handleSearchTerm = (e, val) => {
    this.setState({searchTerm: val, filteredIssues: [], tableSettings: Object.assign({}, this.state.tableSettings, {pageNum: 0})});
  }

  // Opens the modal with the appropriate form based on the issue passed in
  handleReviewClick = (activeIssue) => {
    if (!this.props.disableReview) return;
    this.setState({
      modalOpen: true,
      activeIssue: activeIssue
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
      },
      activeIndex: -1,
    })
  }

  handleActiveIssue(newIssue, newIndex) {
    this.setState({
      activeIssue: newIssue,
      activeIndex: Number(newIndex)
    })
  }

  handleTableSettings = (setting) => {
    this.setState({
      tableSettings: Object.assign({}, this.state.tableSettings, setting)
    });
  }

  getContentById = (contentId) => {
    return Object.assign({}, this.props.report.contentItems[contentId]);
  }

  getFilteredContent = () => {
    const report = this.props.report;
    const filters = Object.assign({}, this.state.filters);
    const { sortBy, ascending } = this.state.tableSettings
    console.log(filters)
    let filteredList = [];
    let issueList = Object.assign({}, report.issues);

    // Check for easy issues filter
    if(filters.easyIssues && filters.issueTitles.length == 0) {
      filters.issueTitles = this.easyRules
    }

    // Loop through the issues
    issueLoop: for (const [key, value] of Object.entries(issueList)) {
      let issue = Object.assign({}, value)

      // Check if we are interested in this issue severity, aka "type"
      if (filters.issueTypes.length !== 0 && !filters.issueTypes.includes(issue.type)) {
        continue;
      }

      // Check if we are interested in issues with this rule impact
      if (filters.issueImpacts.length !== 0
          && !(filters.issueImpacts.includes('visual') && this.visualRules.includes(issue.scanRuleId))
          && !(filters.issueImpacts.includes('auditory') && this.auditoryRules.includes(issue.scanRuleId))
          && !(filters.issueImpacts.includes('cognitive') && this.cognitiveRules.includes(issue.scanRuleId))
          && !(filters.issueImpacts.includes('motor') && this.motorRules.includes(issue.scanRuleId))
        ) {
        continue;
      }

      // Check if we are interested in issues with this rule title
      if (filters.issueTitles.length !== 0 && !filters.issueTitles.includes(issue.scanRuleId)) {
        continue;
      }

      // Check if we are filtering by issue status
      if (!issue.recentlyUpdated && !issue.recentlyResolved) {
        if (filters.issueStatus.length !== 0 && !filters.issueStatus.includes(issueStatusKeys[issue.status])) {
          continue;
        }
      }

      // Get information about the content the issue refers to
      var contentItem = this.getContentById(issue.contentItemId)

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

      let status
      if (issue.status == 2) {
        status = <>
          <ScreenReaderContent>{this.props.t('label.resolved')}</ScreenReaderContent>
          <IconCheckLine color="brand" />
        </>
      }
      else if (issue.status == 1) {
        status = <>
          <ScreenReaderContent>{this.props.t('label.fixed')}</ScreenReaderContent>
          <IconCheckLine color="success" />
        </>
      }
      else {
        if ('error' === issue.type) {
          status = <>
            <ScreenReaderContent>{this.props.t('label.error')}</ScreenReaderContent>
            <IconNoLine className={Classes.error} />
          </>
        }
        else {
          status = <>
            <ScreenReaderContent>{this.props.t('label.suggestion')}</ScreenReaderContent>
            <IconInfoBorderlessLine className={Classes.suggestion} />
          </>
        }
      }

      filteredList.push(
        {
          id: issue.id,
          issue,
          status,
          scanRuleLabel: this.props.t(`rule.label.${issue.scanRuleId}`),
          contentType: this.props.t(`content.${contentItem.contentType}`),
          contentTitle: contentItem.title,
          action: (
            <Button key={`reviewButton${key}`}
              onClick={() => this.handleReviewClick(issue)}
              textAlign="center"
              disabled={!this.props.disableReview}
            >
                {this.props.t('label.review')}
                <ScreenReaderContent>{this.props.t(`rule.label.${issue.scanRuleId}`)}</ScreenReaderContent>
            </Button>
          ),
          onClick: () => this.handleReviewClick(issue),
        }
      );
    }

    filteredList.sort((a, b) => {
      if (isNaN(a[sortBy]) || isNaN(b[sortBy])) {
        return (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) ? -1 : 1;
      }
      else {
        return (Number(a[sortBy]) < Number(b[sortBy])) ? -1 : 1;
      }
    });

    if (!ascending) {
      filteredList.reverse();
    }

    return filteredList;
  }

  render() {
    const filteredRows = this.getFilteredContent();
    const activeContentItem = (this.state.activeIssue) ? this.getContentById(this.state.activeIssue.contentItemId) : null

    return (
      <View as="div" key="contentPageFormWrapper" padding="small 0" margin="none">
        <ContentPageForm
          handleSearchTerm={this.handleSearchTerm}
          handleTrayToggle={this.handleTrayToggle}
          searchTerm={this.state.searchTerm}
          t={this.props.t}
          ref={(node) => this.contentPageForm = node}
          handleTableSettings={this.handleTableSettings}
          tableSettings={this.state.tableSettings}
        />
        <View as="div">
          {this.renderFilterTags()}
        </View>
        <SortableTable
          caption={this.props.t('content_page.issues.table.caption')}
          headers = {this.headers}
          rows = {filteredRows}
          filters = {this.state.filters}
          tableSettings = {this.state.tableSettings}
          handleFilter = {this.handleFilter}
          handleTableSettings = {this.handleTableSettings}
          t={this.props.t}
          rowsPerPage = {this.state.tableSettings.rowsPerPage}
        />
        {this.state.trayOpen && <ContentTrayForm
          filters={this.state.filters}
          handleFilter={this.handleFilter}
          trayOpen={this.state.trayOpen}
          report={this.props.report}
          handleTrayToggle={this.handleTrayToggle}
          t={this.props.t}
          settings={this.props.settings}
        />}
        {this.state.modalOpen && <UfixitModal
          open={this.state.modalOpen}
          activeIssue={this.state.activeIssue}
          activeIndex={this.state.activeIndex}
          filteredRows={filteredRows}
          activeContentItem={activeContentItem}
          settings={this.props.settings}
          handleCloseButton={this.handleCloseButton}
          handleActiveIssue={this.handleActiveIssue}
          handleIssueSave={this.props.handleIssueSave}
          t={this.props.t}
          />}

        {filteredRows.length === 0 &&
            <Billboard
            size="medium"
            heading={this.props.t('label.no_results_header')}
            margin="small"
            message={this.props.t('label.no_results_message')}
        />}
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
      issueImpacts: [],
      issueStatus: ['active'],
    };
  }

  renderFilterTags() {
    let tags = [];

    for (const contentType of this.state.filters.contentTypes) {
      const id = `contentTypes||${contentType}`;
      tags.push({ id: id, label: this.props.t(`content.plural.${contentType}`)});
    }

    for (const issueType of this.state.filters.issueTypes) {
      const id = `issueTypes||${issueType}`
      tags.push({ id: id, label: this.props.t(`label.plural.${issueType}`)});
    }

    for (const issueImpact of this.state.filters.issueImpacts) {
      const id = `issueImpacts||${issueImpact}`
      tags.push({ id: id, label: this.props.t(`label.filter.${issueImpact}`)});
    }

    for (const ruleId of this.state.filters.issueTitles) {
      const id = `issueTitles||${ruleId}`
      tags.push({ id: id, label: this.props.t(`rule.label.${ruleId}`) });
    }

    for (const statusVal of this.state.filters.issueStatus) {
      const id = `issueStatus||${statusVal}`
      tags.push({ id: id, label: this.props.t(`label.filter.${statusVal}`) });
    }

    if (this.state.filters.hideUnpublishedContentItems) {
      tags.push({ id: `hideUnpublishedContentItems||true`, label: this.props.t(`label.hide_unpublished`) });
    }
    if (this.state.filters.easyIssues) {
      tags.push({ id: `easyIssues||true`, label: this.props.t(`label.show_easy_issues`) });
    }

    return tags.map((tag, i) => {
      return (
      <Tag margin="0 small small 0"
        text={tag.label}
        dismissible={true}
        onClick={(e) => this.handleTagClick(tag.id, e)}
        key={i}
        elementRef={(node) => this[`tag${i}`] = node}
      />
    )});
  }

  handleTagClick(tagId, e) {
    let [filterType, filterId] = tagId.split('||');
    let results = null;
    let index = 0

    switch (filterType) {
      case 'contentTypes':
        index += this.state.filters.contentTypes.findIndex((val) => filterId == val)
        results = this.state.filters.contentTypes.filter((val) => filterId !== val);
        break;
      case 'issueTypes':
        index = this.state.filters.contentTypes.length
        index += this.state.filters.issueTypes.findIndex((val) => filterId == val)
        results = this.state.filters.issueTypes.filter((val) => filterId !== val);
        break;
      case 'issueTitles':
        index = this.state.filters.contentTypes.length + this.state.filters.issueTypes.length
        index += this.state.filters.issueTitles.findIndex((val) => filterId == val)
        results = this.state.filters.issueTitles.filter((val) => filterId !== val);
        break;
      case 'issueStatus':
        index = this.state.filters.contentTypes.length + this.state.filters.issueTypes.length + this.state.filters.issueTitles.length
        index += this.state.filters.issueStatus.findIndex((val) => filterId == val)
        results = this.state.filters.issueStatus.filter((val) => filterId != val);
        break;
      case 'issueImpacts':
        index = this.state.filters.contentTypes.length + this.state.filters.issueTypes.length + this.state.filters.issueTitles.length + this.state.filters.issueStatus.length
        index += this.state.filters.issueImpacts.findIndex((val) => filterId == val)
        results = this.state.filters.issueImpacts.filter((val) => filterId != val);
        break;
      case 'hideUnpublishedContentItems':
        index = this.state.filters.contentTypes.length + this.state.filters.issueTypes.length + this.state.filters.issueTitles.length + this.state.filters.issueStatus.length + this.state.filters.issueImpacts.length
        results = false;
        break;
    }

    this.handleFilter({ [filterType]: results });
    if (index - 1 >= 0) {
      setTimeout(() => {
        this[`tag${index - 1}`].focus()
      })
    } else {
      setTimeout(() => {
        this.contentPageForm.focus()
      })
    }
  }
}

export default ContentPage;
