import React, { useState, useEffect } from 'react';
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
import Classes from '../../css/theme-overrides.css'
import { issueRuleIds } from './Constants'
import Api from '../Services/Api'

const issueStatusKeys = [
  'active',
  'fixed',
  'resolved'
]

export default function FixIssuesPage({ report, setReport, settings, handleIssueSave, appFilters, handleAppFilters, disableReview, t }) {
  const filteredIssues = [];
  const headers = [
    { id: "status", text: '', alignText: "center" },
    { id: "contentTitle", text: t('label.header.title') },
    { id: "contentType", text: t('label.header.type') },
    { id: "scanRuleLabel", text: t('label.issue') },
    { id: "action", text: "", alignText: "end" }
  ]

  const easyRules = issueRuleIds.filter(rule => settings.easyRuleIds.includes(rule))
  const visualRules = issueRuleIds.filter(rule => settings.visualRuleIds.includes(rule))
  const auditoryRules = issueRuleIds.filter(rule => settings.auditoryRuleIds.includes(rule))
  const cognitiveRules = issueRuleIds.filter(rule => settings.cognitiveRuleIds.includes(rule))
  const motorRules = issueRuleIds.filter(rule => settings.motorRuleIds.includes(rule))

  const [activeContentItem, setActiveContentItem] = useState(null)
  const [activeIssue, setActiveIssue] = useState(null)
  const [trayOpen, setTrayOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    contentTypes: [],
    issueTypes: [],
    issueTitles: [],
    issueStatus: ['active'],
    issueImpacts: [],
    hideUnpublishedContentItems: false,
    easyIssues: false,
  })
  const [tableSettings, setTableSettings] = useState({
    sortBy: 'contentTitle',
    ascending: true,
    pageNum: 0,
    rowsPerPage: (localStorage.getItem('rowsPerPage')) ? localStorage.getItem('rowsPerPage') : '10'
  })

  useEffect(() => {
    if (Object.keys(appFilters).length > 0) {
      const newFilters = Object.assign({}, resetFilters(), appFilters);
      handleAppFilters({});
      setFilters(newFilters);
    }
  }, [])

  useEffect(() => {
    if(activeIssue === null) return;

    console.log("Triggering useEffect for activeIssue")
    console.log(activeIssue)
    let api = new Api(settings)
    api.getIssueContent(activeIssue.id)
    .then((response) => {
      console.log("Repsonse from getIssueContent")
      console.log(response)
      return response.json()
    }).then((data) => {
      console.log("Data from getIssueContent")
      console.log(data)
      setActiveContentItem(data.data)
    })
  }, [activeIssue])

  const handleSearchTerm = (e, val) => {
    setSearchTerm(val);
    setFilteredIssues([]);
    setTableSettings(Object.assign({}, tableSettings, { pageNum: 0 }));
  }

  const handleReviewClick = (activeIssue) => {
    if (!disableReview) return;
    setModalOpen(true);
    setActiveIssue(activeIssue);
  }

  const handleCloseButton = () => {
    const newReport = { ...report };
    newReport.issues = newReport.issues.map((issue) => {
      issue.recentlyResolved = false;
      issue.recentlyUpdated = false;
      return issue;
    });
    
    setModalOpen(false);
    setReport(newReport);
  }

  const handleTrayToggle = (e, val) => {
    setTrayOpen(!trayOpen);
  }

  const handleFilter = (filter) => {
    setFilters(Object.assign({}, filters, filter));
    setTableSettings({
      sortBy: 'scanRuleLabel',
      ascending: true,
      pageNum: 0,
    });
    setActiveIndex(-1);
  }

  const handleActiveIssue = (newIssue, newIndex = undefined) => {
    setActiveIssue(newIssue);
    if(newIndex !== undefined) {
      setActiveIndex(Number(newIndex));
    }
  }

  const handleTableSettings = (setting) => {
    setTableSettings(Object.assign({}, tableSettings, setting));
  }

  const getContentById = (contentId) => {
    return Object.assign({}, report.contentItems[contentId]);
  }

  const getFilteredContent = () => {
    let filteredList = [];
    let issueList = Object.assign({}, report.issues);
    const tempFilters = Object.assign({}, filters);

    // Check for easy issues filter
    if (tempFilters.easyIssues && tempFilters.issueTitles.length == 0) {
      tempFilters.issueTitles = easyRules
    }

    // Loop through the issues
    issueLoop: for (const [key, value] of Object.entries(issueList)) {
      let issue = Object.assign({}, value)

      // Check if we are interested in this issue severity, aka "type"
      if (tempFilters.issueTypes.length !== 0 && !tempFilters.issueTypes.includes(issue.type)) {
        continue;
      }

      // Check if we are interested in issues with this rule impact
      if (tempFilters.issueImpacts.length !== 0
        && !(tempFilters.issueImpacts.includes('visual') && visualRules.includes(issue.scanRuleId))
        && !(tempFilters.issueImpacts.includes('auditory') && auditoryRules.includes(issue.scanRuleId))
        && !(tempFilters.issueImpacts.includes('cognitive') && cognitiveRules.includes(issue.scanRuleId))
        && !(tempFilters.issueImpacts.includes('motor') && motorRules.includes(issue.scanRuleId))
      ) {
        continue;
      }

      // Check if we are interested in issues with this rule title
      if (tempFilters.issueTitles.length !== 0 && !tempFilters.issueTitles.includes(issue.scanRuleId)) {
        continue;
      }

      // Check if we are filtering by issue status
      if (!issue.recentlyUpdated && !issue.recentlyResolved) {
        if (tempFilters.issueStatus.length !== 0 && !tempFilters.issueStatus.includes(issueStatusKeys[issue.status])) {
          continue;
        }
      }

      // Get information about the content the issue refers to
      var contentItem = getContentById(issue.contentItemId)

      // Check if we are showing unpublished content items
      if (tempFilters.hideUnpublishedContentItems && !contentItem.status) {
        continue;
      }

      // Check if we are filtering by content type
      if (tempFilters.contentTypes.length !== 0 && !tempFilters.contentTypes.includes(contentItem.contentType)) {
        continue;
      }

      // Filter by search term
      if (!issue.keywords) {
        issue.keywords = createKeywords(issue, contentItem);
      }
      if (searchTerm !== '') {
        const searchTerms = searchTerm.toLowerCase().split(' ');

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
          <ScreenReaderContent>{t('label.resolved')}</ScreenReaderContent>
          <IconCheckLine color="brand" />
        </>
      }
      else if (issue.status == 1) {
        status = <>
          <ScreenReaderContent>{t('label.fixed')}</ScreenReaderContent>
          <IconCheckLine color="success" />
        </>
      }
      else {
        if ('error' === issue.type) {
          status = <>
            <ScreenReaderContent>{t('label.error')}</ScreenReaderContent>
            <IconNoLine className={Classes.error} />
          </>
        }
        else {
          status = <>
            <ScreenReaderContent>{t('label.suggestion')}</ScreenReaderContent>
            <IconInfoBorderlessLine className={Classes.suggestion} />
          </>
        }
      }

      filteredList.push(
        {
          id: issue.id,
          issue,
          status,
          scanRuleLabel: t(`rule.label.${issue.scanRuleId}`),
          contentType: t(`content.${contentItem.contentType}`),
          contentTitle: contentItem.title,
          action: (
            <Button key={`reviewButton${key}`}
              onClick={() => handleReviewClick(issue)}
              textAlign="center"
              disabled={!disableReview}
            >
                {t('label.review')}
                <ScreenReaderContent>{t(`rule.label.${issue.scanRuleId}`)}</ScreenReaderContent>
            </Button>
          ),
          onClick: () => handleReviewClick(issue),
        }
      );
    }

    filteredList.sort((a, b) => {
      if (isNaN(a[tableSettings.sortBy]) || isNaN(b[tableSettings.sortBy])) {
        return (a[tableSettings.sortBy].toLowerCase() < b[tableSettings.sortBy].toLowerCase()) ? -1 : 1;
      }
      else {
        return (Number(a[tableSettings.sortBy]) < Number(b[tableSettings.sortBy])) ? -1 : 1;
      }
    });

    if (!tableSettings.ascending) {
      filteredList.reverse();
    }

    return filteredList;
  }

  const createKeywords = (issue, contentItem) => {
    let keywords = [];

    keywords.push(t(`rule.label.${issue.scanRuleId}`).toLowerCase());
    keywords.push(t(`label.${contentItem.contentType}`).toLowerCase());
    keywords.push(contentItem.title.toLowerCase());

    return keywords.join(' ');
  }

  const resetFilters = () => {
    return {
      contentTypes: [],
      hideUnpublishedContentItems: false,
      issueTypes: [],
      issueTitles: [],
      issueImpacts: [],
      issueStatus: ['active'],
    };
  }

  const renderFilterTags = () => {
    let tags = [];

    for (const contentType of filters.contentTypes) {
      const id = `contentTypes||${contentType}`;
      tags.push({ id: id, label: t(`content.plural.${contentType}`)});
    }

    for (const issueType of filters.issueTypes) {
      const id = `issueTypes||${issueType}`
      tags.push({ id: id, label: t(`label.plural.${issueType}`)});
    }

    for (const issueImpact of filters.issueImpacts) {
      const id = `issueImpacts||${issueImpact}`
      tags.push({ id: id, label: t(`label.filter.${issueImpact}`)});
    }

    for (const ruleId of filters.issueTitles) {
      const id = `issueTitles||${ruleId}`
      tags.push({ id: id, label: t(`rule.label.${ruleId}`) });
    }

    for (const statusVal of filters.issueStatus) {
      const id = `issueStatus||${statusVal}`
      tags.push({ id: id, label: t(`label.filter.${statusVal}`) });
    }

    if (filters.hideUnpublishedContentItems) {
      tags.push({ id: `hideUnpublishedContentItems||true`, label: t(`label.hide_unpublished`) });
    }

    if (filters.easyIssues) {
      tags.push({ id: `easyIssues||true`, label: t(`label.show_easy_issues`) });
    }

    return tags.map((tag, i) => {
      return (
        <Tag margin="0 small small 0"
          text={tag.label}
          dismissible={true}
          onClick={(e) => handleTagClick(tag.id, e)}
          key={i}
        />
      )
    });
  }

  const handleTagClick = (tagId, e) => {
    let [filterType, filterId] = tagId.split('||');
    let results = null;
    let index = 0

    switch (filterType) {
      case 'contentTypes':
        index += filters.contentTypes.findIndex((val) => filterId == val)
        results = filters.contentTypes.filter((val) => filterId !== val);
        break;
      case 'issueTypes':
        index = filters.contentTypes.length
        index += filters.issueTypes.findIndex((val) => filterId == val)
        results = filters.issueTypes.filter((val) => filterId !== val);
        break;
      case 'issueTitles':
        index = filters.contentTypes.length + filters.issueTypes.length
        index += filters.issueTitles.findIndex((val) => filterId == val)
        results = filters.issueTitles.filter((val) => filterId !== val);
        break;
      case 'issueStatus':
        index = filters.contentTypes.length + filters.issueTypes.length + filters.issueTitles.length
        index += filters.issueStatus.findIndex((val) => filterId == val)
        results = filters.issueStatus.filter((val) => filterId != val);
        break;
      case 'issueImpacts':
        index = filters.contentTypes.length + filters.issueTypes.length + filters.issueTitles.length + filters.issueStatus.length
        index += filters.issueImpacts.findIndex((val) => filterId == val)
        results = filters.issueImpacts.filter((val) => filterId != val);
        break;
      case 'hideUnpublishedContentItems':
        index = filters.contentTypes.length + filters.issueTypes.length + filters.issueTitles.length + filters.issueStatus.length + filters.issueImpacts.length
        results = false;
        break;
    }

    handleFilter({ [filterType]: results });
  }

  const filteredRows = getFilteredContent()

  return (
    <View as="div" key="contentPageFormWrapper" padding="small 0" margin="none">
      <ContentPageForm
        handleSearchTerm={handleSearchTerm}
        handleTrayToggle={handleTrayToggle}
        searchTerm={searchTerm}
        t={t}
        handleTableSettings={handleTableSettings}
        tableSettings={tableSettings}
      />
      <View as="div">
        {renderFilterTags()}
      </View>
      <div>Hello, World!!!!</div>
      <SortableTable
        caption={t('content_page.issues.table.caption')}
        headers = {headers}
        rows = {filteredRows}
        filters = {filters}
        tableSettings = {tableSettings}
        handleFilter = {handleFilter}
        handleTableSettings = {handleTableSettings}
        t={t}
        rowsPerPage = {tableSettings.rowsPerPage}
      />
      {trayOpen && <ContentTrayForm
        filters={filters}
        handleFilter={handleFilter}
        trayOpen={trayOpen}
        report={report}
        handleTrayToggle={handleTrayToggle}
        t={t}
        settings={settings}
      />}
      {modalOpen && <UfixitModal
        open={modalOpen}
        activeIssue={activeIssue}
        activeIndex={activeIndex}
        filteredRows={filteredRows}
        activeContentItem={ activeIssue ? getContentById(activeIssue.contentItemId) : null }
        settings={settings}
        handleCloseButton={handleCloseButton}
        handleActiveIssue={handleActiveIssue}
        handleIssueSave={handleIssueSave}
        t={t}
        />}

      {filteredRows.length === 0 &&
          <Billboard
          size="medium"
          heading={t('label.no_results_header')}
          margin="small"
          message={t('label.no_results_message')}
      />}
    </View>
  )
}