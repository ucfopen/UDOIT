import React, { useState, useEffect } from 'react';
import FixIssuesFilters from './FixIssuesFilters';
import FixIssuesList from './FixIssuesList';
import FixIssuesContentPreview from './FixIssuesContentPreview';
import UfixitWidget from './UfixitWidget'
import * as Html from '../Services/Html'
import Api from '../Services/Api'

import './FixIssuesPage.css'


// import SortableTable from './SortableTable'
// import ContentPageForm from './ContentPageForm'
// import ContentTrayForm from './ContentTrayForm'
// import ReactHtmlParser from 'react-html-parser'
// import UfixitModal from './UfixitModal'
// import Classes from '../../css/theme-overrides.css'
// import { issueRuleIds } from './Constants'

export default function FixIssuesPage({
  t,
  settings,
  initialSeverity = '',
  contentItemList,
  addContentItem,
  report,
  sections,
  setReport,
  addMessage,
  handleIssueSave, 
  handleIssueUpdate,
  disableReview })
{

  // Define the kinds of filters that will be available to the user
  const FILTER = {
    TYPE: {
      SEVERITY: 'SEVERITY',
      CONTENT_TYPE: 'CONTENT_TYPE',
      RESOLUTION: 'RESOLUTION',
      MODULE: 'MODULE',
    },
    ALL: 'ALL',
    ISSUE: 'ISSUE',
    POTENTIAL: 'POTENTIAL',
    SUGGESTION: 'SUGGESTION',
    PAGE: 'PAGE',
    ASSIGNMENT: 'ASSIGNMENT',
    ANNOUNCEMENT: 'ANNOUNCEMENT',
    DISCUSSION_TOPIC: 'DISCUSSION_TOPIC',
    DISCUSSION_FORUM: 'DISCUSSION_FORUM',
    FILE: 'FILE',
    QUIZ: 'QUIZ',
    SYLLABUS: 'SYLLABUS',
    MODULE: 'MODULE',
    ACTIVE: 'ACTIVE',
    FIXED: 'FIXED',
    RESOLVED: 'RESOLVED',
  }
  
  const SEVERITY_OPTIONS = {
    [FILTER.ALL]: t('label.filter.severity.all'),
    [FILTER.ISSUE]: t('label.filter.severity.issue'),
    [FILTER.POTENTIAL]: t('label.filter.severity.potential'),
    [FILTER.SUGGESTION]: t('label.filter.severity.suggestion'),
  } 

  const CONTENT_TYPE = {
    [FILTER.ALL]: t('label.filter.type.all'),
    [FILTER.PAGE]: t('label.filter.type.page'),
    [FILTER.ASSIGNMENT]: t('label.filter.type.assignment'),
    [FILTER.ANNOUNCEMENT]: t('label.filter.type.announcement'),
    [FILTER.DISCUSSION_TOPIC]: t('label.filter.type.discussion_topic'),
    [FILTER.DISCUSSION_FORUM]: t('label.filter.type.discussion_forum'),
    [FILTER.FILE]: t('label.filter.type.file'),
    [FILTER.QUIZ]: t('label.filter.type.quiz'),
    [FILTER.SYLLABUS]: t('label.filter.type.syllabus'),
    [FILTER.MODULE]: t('label.filter.type.module'),
  }

  const RESOLUTION_OPTIONS = {
    [FILTER.ALL]: t('label.filter.resolution.all'),
    [FILTER.ACTIVE]: t('label.filter.resolution.active'),
    [FILTER.FIXED]: t('label.filter.resolution.fixed'),
    [FILTER.RESOLVED]: t('label.filter.resolution.resolved'),
  }

  const MODULE_OPTIONS = {
    [FILTER.ALL]: t('label.filter.module.all'),
  }

  const allFilters = {
    [FILTER.TYPE.SEVERITY]: SEVERITY_OPTIONS,
    [FILTER.TYPE.CONTENT_TYPE]: CONTENT_TYPE,
    [FILTER.TYPE.RESOLUTION]: RESOLUTION_OPTIONS,
    [FILTER.TYPE.MODULE]: MODULE_OPTIONS,
  }

  const defaultFilters = {
    [FILTER.TYPE.SEVERITY]: FILTER.ALL,
    [FILTER.TYPE.CONTENT_TYPE]: FILTER.ALL,
    [FILTER.TYPE.RESOLUTION]: FILTER.ACTIVE,
    [FILTER.TYPE.MODULE]: FILTER.ALL,
  }

  const WIDGET_STATE = {
    LOADING: 0,
    FIXIT: 1,
    LEARN: 2,
    LIST: 3,
    NO_RESULTS: 4,
  }

  // const easyRules = issueRuleIds.filter(rule => settings.easyRuleIds.includes(rule))
  // const visualRules = issueRuleIds.filter(rule => settings.visualRuleIds.includes(rule))
  // const auditoryRules = issueRuleIds.filter(rule => settings.auditoryRuleIds.includes(rule))
  // const cognitiveRules = issueRuleIds.filter(rule => settings.cognitiveRuleIds.includes(rule))
  // const motorRules = issueRuleIds.filter(rule => settings.motorRuleIds.includes(rule))

  const [activeIssue, setActiveIssue] = useState(null)
  const [activeContentItem, setActiveContentItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [usedFilters, setUsedFilters] = useState([])
  const [activeFilters, setActiveFilters] = useState(defaultFilters)
  const [filteredIssues, setFilteredIssues] = useState([])
  const [widgetState, setWidgetState] = useState(WIDGET_STATE.LOADING)
  const [viewInfo, setViewInfo] = useState(false)

  const getActiveIssueIndex = () => {
    if (activeIssue === null) return -1;
    return filteredIssues.findIndex((issue) => issue.id === activeIssue.id);
  }

  // The initialSeverity prop is used when clicking a "Fix Issues" button from the main dashboard.
  useEffect(() => {
    let tempSeverity = initialSeverity || FILTER.ALL
    setActiveFilters(Object.assign({}, defaultFilters, {[FILTER.TYPE.SEVERITY]: tempSeverity}))
  }, [initialSeverity])
  
  useEffect(() => {
    let tempFilters = Object.assign({}, allFilters)
    if(sections && sections.length > 0) {
      sections.forEach((section) => {
        tempFilters[FILTER.TYPE.MODULE][section.id] = section.title
      })
    }
    else {
      delete tempFilters[FILTER.TYPE.MODULE]
    }
    setUsedFilters(tempFilters)
  })

  // When the filters or search term changes, update the available issues
  useEffect(() => {

    let tempFilteredContent = getFilteredContent()
    setFilteredIssues(tempFilteredContent)
    setActiveIssue(null)

    // If nothing matches the filters, show the no results view
    if(tempFilteredContent.length === 0) {
      setWidgetState(WIDGET_STATE.NO_RESULTS)
    }
    else {
      // Otherwise, view the list
      setWidgetState(WIDGET_STATE.LIST)
    }

  }, [activeFilters, searchTerm])

  // When a new activeIssue is set, get the content for that issue
  useEffect(() => {
    if(activeIssue === null) {
      setActiveContentItem(null)
      if(widgetState === WIDGET_STATE.LIST) {
        return
      }
      setWidgetState(WIDGET_STATE.NO_RESULTS)
      return
    }
  
    setWidgetState(WIDGET_STATE.FIXIT)

    // If we've already downloaded the content for this issue, use that
    const contentItemId = activeIssue.issue.contentItemId
    if(contentItemList[contentItemId]) {
      setActiveContentItem(contentItemList[contentItemId])
      return
    }

    // Otherwise, clear the old content and download the content for this issue
    setActiveContentItem(null)
    let api = new Api(settings)
    api.getIssueContent(activeIssue.id)
    .then((response) => {
      return response.json()
    }).then((data) => {
      if(data?.data?.contentItem) {
        setActiveContentItem(data.data.contentItem)
        addContentItem(data.data.contentItem)
      }
    })
  }, [activeIssue])

  const handleSearchTerm = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  }

  const updateIssue = (newIssue) => {
    const tempReport = Object.assign({}, report)
    tempReport.issues = tempReport.issues.map((issue) => {
      if (issue.id === newIssue.id) {
        const tempIssue = formatIssueData(newIssue)
        setActiveIssue(tempIssue)
        return tempIssue
      }
      return issue
    })
    setReport(tempReport)
  }

  const formatIssueData = (issue) => {

    let issueSeverity = FILTER.ISSUE
    // PHPAlly returns a type of 'error' or 'suggestion'
    if(issue.type == 'suggestion') {
      issueSeverity = FILTER.SUGGESTION
    }
    
    let issueContentType = FILTER.ALL
    let issueSectionId = -1

    // PHPAlly returns a contentItemId that we can use to get the content type
    let tempContentItem = getContentById(issue.contentItemId)
    if(tempContentItem) {
      let tempContentType = tempContentItem.contentType
      if(tempContentType == 'page') {
        issueContentType = FILTER.PAGE
      }
      else if(tempContentType == 'assignment') {
        issueContentType = FILTER.ASSIGNMENT
      }
      else if(tempContentType == 'announcement') {
        issueContentType = FILTER.ANNOUNCEMENT
      }
      else if(tempContentType == 'discussion_topic') {
        issueContentType = FILTER.DISCUSSION_TOPIC
      }
      else if(tempContentType == 'discussion_forum') {
        issueContentType = FILTER.DISCUSSION_FORUM
      }
      else if(tempContentType == 'file') {
        issueContentType = FILTER.FILE
      }
      else if(tempContentType == 'quiz') {
        issueContentType = FILTER.QUIZ
      }
      else if(tempContentType == 'syllabus') {
        issueContentType = FILTER.SYLLABUS
      }
      else if(tempContentType == 'module') {
        issueContentType = FILTER.MODULE
      }

      // See if the issue is listed in one of the sections
      // TODO: Find a more consistent way to filter this that works with less bespoke data.
      if(sections && sections.length > 0) {
        sections.forEach((section) => {
          let tempSectionId = section.id
          section.items.forEach((item) => {
            if(item.page_url === tempContentItem.lmsContentId) {
              issueSectionId = tempSectionId
            }
          })
        })
      }
    }

    let issueResolution = FILTER.ACTIVE
    // PHPAlly returns a status of 1 for fixed issues and 2 for resolved issues
    if(issue.status == 1) {
      issueResolution = FILTER.FIXED
    }
    else if(issue.status == 2) {
      issueResolution = FILTER.RESOLVED
    }

    return {
      id: issue.id,
      issue: Object.assign({}, issue),
      severity: issueSeverity,
      status: issueResolution,
      sectionId: issueSectionId,
      keywords: createKeywords(issue, tempContentItem),
      scanRuleLabel: t(`rule.label.${issue.scanRuleId}`),
      contentId: tempContentItem.lmsContentId,
      contentType: issueContentType,
      contentTypeLabel: t(`content.${tempContentItem.contentType}`),
      contentTitle: tempContentItem.title,
      contentUrl: tempContentItem.url,
    }
  }

  const handleIssueResolve = () => {
    if (activeIssue.pending) {
      return
    }

    let tempIssue = Object.assign({}, activeIssue.issue)
    if (tempIssue.status) {
      tempIssue.status = false
      tempIssue.newHtml = Html.toString(Html.removeClass(tempIssue.sourceHtml, 'phpally-ignore'))
    }
    else {
      tempIssue.status = 2
      tempIssue.newHtml = Html.toString(Html.addClass(tempIssue.sourceHtml, 'phpally-ignore'))
    }

    let api = new Api(settings)
    api.resolveIssue(tempIssue)
      .then((responseStr) => responseStr.json())
      .then((response) => {      
        // set messages 
        response.messages.forEach((msg) => addMessage(msg))
      
        if (response.data.issue) {
          const newIssue = { ...tempIssue, ...response.data.issue }
          const newReport = response.data.report

          // update activeIssue
          newIssue.pending = false
          newIssue.recentlyResolved = !!tempIssue.status
          newIssue.sourceHtml = newIssue.newHtml
          newIssue.newHtml = ''
          // Get updated report
          api.scanContent(newIssue.contentItemId)
          .then((responseStr) => responseStr.json())
          .then((res) => {
            // update activeIssue
            updateIssue(newIssue)
            handleIssueSave(newIssue, res.data)
          })
        }
        else {
          tempIssue.pending = false
          updateIssue(tempIssue)
        }
      })

    tempIssue.pending = 2
    updateIssue(tempIssue)
  }

  // const handleCloseButton = () => {
  //   const newReport = { ...report };
  //   newReport.issues = newReport.issues.map((issue) => {
  //     issue.recentlyResolved = false;
  //     issue.recentlyUpdated = false;
  //     return issue;
  //   });
    
  //   setModalOpen(false);
  //   setReport(newReport);
  // }

  const updateActiveFilters = (filter, value) => {
    setActiveFilters(Object.assign({}, activeFilters, {[filter]: value}));
  }

  const nextIssue = (previous = false) => {
    if (filteredIssues.length === 0) return
    let activeIndex = getActiveIssueIndex()

    if(activeIndex === -1) {
      return;
    }

    let newIndex = activeIndex + (previous ? -1 : 1);
    if (newIndex < 0) {
      newIndex = filteredIssues.length - 1;
    }
    else if (newIndex >= filteredIssues.length) {
      newIndex = 0;
    }
    setActiveIssue(filteredIssues[newIndex]);
  }

  const toggleListView = () => {
    if (widgetState === WIDGET_STATE.LIST) {
      if(activeIssue) {
        setWidgetState(WIDGET_STATE.FIXIT)
      }
      else {
        setWidgetState(WIDGET_STATE.NO_RESULTS)
      }
    }
    else {
      setWidgetState(WIDGET_STATE.LIST)
      setActiveIssue(null)
      setActiveContentItem(null)
    }
  }

  const getContentById = (contentId) => {
    return Object.assign({}, report.contentItems[contentId]);
  }

  const createKeywords = (issue, contentItem) => {
    let keywords = [];

    if(issue?.scanRuleId) {
      keywords.push(t(`rule.label.${issue.scanRuleId}`).toLowerCase());
    }
    if(contentItem?.contentType) {
      keywords.push(t(`label.${contentItem.contentType}`).toLowerCase());
    }
    if(contentItem?.title) {
      keywords.push(contentItem.title.toLowerCase());
    }

    return keywords.join(' ');
  }

  const getFilteredContent = () => {
    let filteredList = [];
    let issueList = Object.assign({}, report.issues);
    const tempFilters = Object.assign({}, activeFilters);

    // PHPAlly Issues have a 'type' of 'error' or 'suggestion'
    // // Check for easy issues filter
    // if (tempFilters.easyIssues && tempFilters.issueTitles.length == 0) {
    //   tempFilters.issueTitles = easyRules
    // }
    // Loop through the issues
    issueLoop: for (const [key, value] of Object.entries(issueList)) {
      let issue = formatIssueData(value)

      // Skip if we are not interested in this issue severity
      if (tempFilters[FILTER.TYPE.SEVERITY] !== FILTER.ALL && tempFilters[FILTER.TYPE.SEVERITY] !== issue.severity) {
        continue;
      }

      // Skip if we are not interested in this content type
      if (tempFilters[FILTER.TYPE.CONTENT_TYPE] !== FILTER.ALL && tempFilters[FILTER.TYPE.CONTENT_TYPE] !== issue.contentType) {
        continue;
      }

      // Skip if we are not interested in this resolution status
      if (tempFilters[FILTER.TYPE.RESOLUTION] !== FILTER.ALL && tempFilters[FILTER.TYPE.RESOLUTION] !== issue.status) {
        continue;
      }

      // Skip if the issue is not in the selected module
      if (tempFilters[FILTER.TYPE.MODULE] !== FILTER.ALL && tempFilters[FILTER.TYPE.MODULE].toString() !== issue.sectionId.toString()) {
        continue;
      }

      // Filter by search term
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

      filteredList.push(issue)
    }

    filteredList.sort((a, b) => {
      return (a.contentTypeLabel.toLowerCase() < b.contentTypeLabel.toLowerCase()) ? -1 : 1
    })

    return filteredList
  }

  return (
    <>
      <FixIssuesFilters
        allFilters={usedFilters}
        activeFilters={activeFilters}
        sections={sections}
        updateActiveFilters={updateActiveFilters}
        searchTerm={searchTerm}
        handleSearchTerm={handleSearchTerm}
      />
      <div className="ufixit-page-divider">
        <section className="ufixit-widget-container">
          { widgetState === WIDGET_STATE.LIST ? (
            <FixIssuesList
              t={t}
              FILTER={FILTER}
              filteredIssues={filteredIssues}
              setActiveIssue={setActiveIssue}
            />
          ) : activeIssue ? (  
              <UfixitWidget
                t={t}
                settings={settings.FILTER ? settings : Object.assign({}, settings, { FILTER })}
                viewInfo={viewInfo}
                setViewInfo={setViewInfo}
                severity={activeIssue.severity}
                activeIssue={activeIssue}
                setActiveIssue={setActiveIssue}
                handleIssueResolve={handleIssueResolve}
                handleIssueSave={handleIssueSave}
                toggleListView={toggleListView}
                listLength={filteredIssues.length}
                nextIssue={nextIssue}
              />
          ) : (
            <h2>No Issues Found</h2>
          )}
        </section>
        <section className="ufixit-content-container">
          <FixIssuesContentPreview
            t={t}
            activeIssue={activeIssue}
            activeContentItem={activeContentItem}
          />
        </section>
      </div>
    </>
  )

  // return (
  //   <View as="div" key="contentPageFormWrapper" padding="small 0" margin="none">
  //     <ContentPageForm
  //       handleSearchTerm={handleSearchTerm}
  //       handleTrayToggle={handleTrayToggle}
  //       searchTerm={searchTerm}
  //       t={t}
  //       handleTableSettings={handleTableSettings}
  //       tableSettings={tableSettings}
  //     />
  //     <View as="div">
  //       {renderFilterTags()}
  //     </View>
  //     <div>Hello, World!!!!</div>
  //     <SortableTable
  //       caption={t('content_page.issues.table.caption')}
  //       headers = {headers}
  //       rows = {filteredRows}
  //       filters = {filters}
  //       tableSettings = {tableSettings}
  //       handleFilter = {handleFilter}
  //       handleTableSettings = {handleTableSettings}
  //       t={t}
  //       rowsPerPage = {tableSettings.rowsPerPage}
  //     />
  //     {trayOpen && <ContentTrayForm
  //       filters={filters}
  //       handleFilter={handleFilter}
  //       trayOpen={trayOpen}
  //       report={report}
  //       handleTrayToggle={handleTrayToggle}
  //       t={t}
  //       settings={settings}
  //     />}
  //     {modalOpen && <UfixitModal
  //       open={modalOpen}
  //       activeIssue={activeIssue}
  //       activeIndex={activeIndex}
  //       filteredRows={filteredRows}
  //       activeContentItem={ activeIssue ? getContentById(activeIssue.contentItemId) : null }
  //       settings={settings}
  //       handleCloseButton={handleCloseButton}
  //       handleActiveIssue={handleActiveIssue}
  //       handleIssueSave={handleIssueSave}
  //       t={t}
  //       />}

  //     {filteredRows.length === 0 &&
  //         <Billboard
  //         size="medium"
  //         heading={t('label.no_results_header')}
  //         margin="small"
  //         message={t('label.no_results_message')}
  //     />}
  //   </View>
  // )
}