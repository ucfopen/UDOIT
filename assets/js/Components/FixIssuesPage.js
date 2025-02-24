import React, { useState, useEffect } from 'react';
import FixIssuesFilters from './FixIssuesFilters';
import FixIssuesList from './FixIssuesList';
// import { Button } from '@instructure/ui-buttons'
// import { IconCheckLine, IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'
// import { Billboard } from '@instructure/ui-billboard'
// import SortableTable from './SortableTable'
// import ContentPageForm from './ContentPageForm'
// import ContentTrayForm from './ContentTrayForm'
// import { View } from '@instructure/ui-view'
// import { Tag } from '@instructure/ui-tag'
// import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import UfixitWidget from './UfixitWidget'
// import ReactHtmlParser from 'react-html-parser'
// import * as Html from '../Services/Html'
// import { List } from '@instructure/ui-list';
// import UfixitModal from './UfixitModal'
// import Classes from '../../css/theme-overrides.css'
// import { issueRuleIds } from './Constants'
import Api from '../Services/Api'
import './FixissuesPage.css'

import SeverityIssueIcon from './Icons/SeverityIssueIcon'
import SeverityPotentialIcon from './Icons/SeverityPotentialIcon'
import SeveritySuggestionIcon from './Icons/SeveritySuggestionIcon'
import LeftArrowIcon from './Icons/LeftArrowIcon'
import ListIcon from './Icons/ListIcon'
import RightArrowIcon from './Icons/RightArrowIcon'
import ExternalLinkIcon from './Icons/ExternalLinkIcon';

export default function FixIssuesPage({
  t,
  settings,
  initialSeverity = '',
  contentItemList,
  addContentItem,
  report,
  setReport,
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

  const FILTER_TYPES = {
    [FILTER.TYPE.SEVERITY]: t('label.filter.severity'),
    [FILTER.TYPE.CONTENT_TYPE]: t('label.filter.type'),
    [FILTER.TYPE.RESOLUTION]: t('label.filter.resolution'),
    [FILTER.TYPE.MODULE]: t('label.filter.module'),
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

  // When the filters or search term changes, update the available issues
  useEffect(() => {

    const firstLoad = (widgetState === WIDGET_STATE.LOADING)
    let tempFilteredContent = getFilteredContent()
    setFilteredIssues(tempFilteredContent)

    if(tempFilteredContent.length === 0) {
      setActiveIssue(null)
      setWidgetState(WIDGET_STATE.NO_RESULTS)
      return
    }

    // If there is no activeIssue and there is are multiple potential issues, show the list.
    if(!activeIssue && tempFilteredContent.length > 0) {
      if(firstLoad) {
        setActiveIssue(tempFilteredContent[0])
        setWidgetState(WIDGET_STATE.FIXIT)
      }
      else {
        setWidgetState(WIDGET_STATE.LIST)
      }
    }

    // See if the currently activeIssue is still in the filteredIssues...
    if (activeIssue && tempFilteredContent.length > 0) {
      let index = tempFilteredContent.findIndex((issue) => issue.id === activeIssue.id)
      if (index === -1) {
        if(widgetState === WIDGET_STATE.LIST) {
          setActiveContentItem(null)
          return
        }
        // If it isn't, set the activeIssue to the first issue in the list
        if(widgetState === WIDGET_STATE.LOADING) {
          setActiveIssue(tempFilteredContent[0])
          setWidgetState(WIDGET_STATE.FIXIT)
        }
      }
      // Otherwise, keep the activeIssue the same
    }
  }, [report, activeFilters, searchTerm])

  // When a new activeIssue is set, get the content for that issue
  useEffect(() => {
    if(activeIssue === null) {
      if(widgetState === WIDGET_STATE.LIST) {
        return
      }
      setWidgetState(WIDGET_STATE.NO_RESULTS)
      setActiveContentItem(null)
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
        console.log(data.data.contentItem)
        setActiveContentItem(data.data.contentItem)
        addContentItem(data.data.contentItem)
      }
    })
  }, [activeIssue])

  const handleSearchTerm = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  }

  // const handleIssueResolve = () => {
  //   if (activeIssue.pending) {
  //     return
  //   }

  //   let tempIssue = Object.assign({}, activeIssue)
  //   if (tempIssue.status) {
  //     tempIssue.status = false
  //     tempIssue.newHtml = Html.toString(Html.removeClass(tempIssue.sourceHtml, 'phpally-ignore'))
  //   }
  //   else {
  //     tempIssue.status = 2
  //     tempIssue.newHtml = Html.toString(Html.addClass(tempIssue.sourceHtml, 'phpally-ignore'))
  //   }

  //   let api = new Api(settings)
  //   api.resolveIssue(tempIssue)
  //     .then((responseStr) => responseStr.json())
  //     .then((response) => {      
  //       // set messages 
  //       response.messages.forEach((msg) => addMessage(msg))
      
  //       if (response.data.issue) {
  //         const newIssue = { ...tempIssue, ...response.data.issue }
  //         const newReport = response.data.report

  //         // update activeIssue
  //         newIssue.pending = false
  //         newIssue.recentlyResolved = !!tempIssue.status
  //         newIssue.sourceHtml = newIssue.newHtml
  //         newIssue.newHtml = ''
  //         // Get updated report
  //         api.scanContent(newIssue.contentItemId)
  //         .then((responseStr) => responseStr.json())
  //         .then((res) => {
  //           // update activeIssue
  //           setActiveIssue(newIssue)
            
  //           handleIssueSave(newIssue, res.data)
  //         })
  //       }
  //       else {
  //         tempIssue.pending = false
  //         setActiveIssue(tempIssue)
  //       }
  //     })

  //   tempIssue.pending = 2
  //   setActiveIssue(tempIssue)
  // }

  // const handleReviewClick = (activeIssue) => {
  //   if (!disableReview) return;
  //   setModalOpen(true);
  //   setActiveIssue(activeIssue);
  // }

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
    console.log('toggleListView')
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
      let issue = Object.assign({}, value)

      let issueSeverity = FILTER.ISSUE
      // PHPAlly returns a type of 'error' or 'suggestion'
      if(issue.type == 'suggestion') {
        issueSeverity = FILTER.SUGGESTION
      }
      
      let issueContentType = FILTER.ALL
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
      }
        

      let issueResolution = FILTER.ACTIVE
      // PHPAlly returns a status of 1 for fixed issues and 2 for resolved issues
      if(issue.status == 1) {
        issueResolution = FILTER.FIXED
      }
      else if(issue.status == 2) {
        issueResolution = FILTER.RESOLVED
      }

      // Skip if we are not interested in this issue severity
      if (tempFilters[FILTER.TYPE.SEVERITY] !== FILTER.ALL && tempFilters[FILTER.TYPE.SEVERITY] !== issueSeverity) {
        continue;
      }

      // Skip if we are not interested in this content type
      if (tempFilters[FILTER.TYPE.CONTENT_TYPE] !== FILTER.ALL && tempFilters[FILTER.TYPE.CONTENT_TYPE] !== issueContentType) {
        continue;
      }

      // Skip if we are not interested in this resolution status
      if (tempFilters[FILTER.TYPE.RESOLUTION] !== FILTER.ALL && tempFilters[FILTER.TYPE.RESOLUTION] !== issueResolution) {
        continue;
      }

      // Filter by search term
      if (!issue.keywords) {
        issue.keywords = createKeywords(issue, tempContentItem);
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

      filteredList.push(
        {
          id: issue.id,
          issue,
          contentType: issueContentType,
          severity: issueSeverity,
          status: issueResolution,
          scanRuleLabel: t(`rule.label.${issue.scanRuleId}`),
          contentTypeLabel: t(`content.${tempContentItem.contentType}`),
          contentTitle: tempContentItem.title,
          // action: (
          //   <button key={`reviewButton${key}`}
          //     onClick={() => handleReviewClick(issue)}
          //     textAlign="center"
          //     disabled={!disableReview}
          //   >
          //       {t('label.review')}
          //       <ScreenReaderContent>{t(`rule.label.${issue.scanRuleId}`)}</ScreenReaderContent>
          //   </button>
          // ),
          onClick: () => handleReviewClick(issue),
        }
      );
    }

    filteredList.sort((a, b) => {
      return (a.contentTypeLabel.toLowerCase() < b.contentTypeLabel.toLowerCase()) ? -1 : 1
    })

    console.log(filteredList)
    return filteredList
  }

  return (
    <>
      <FixIssuesFilters
        allFilters={allFilters}
        activeFilters={activeFilters}
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
                settings={settings}
                viewInfo={viewInfo}
                setViewInfo={setViewInfo}
                severity={activeIssue.severity}
                activeIssue={activeIssue}
                setActiveIssue={setActiveIssue}
                handleIssueSave={handleIssueSave}
                toggleListView={toggleListView}
                nextIssue={nextIssue}
              />
          ) : (
            <h2>No Issues Found</h2>
          )}
        </section>
        <section className="ufixit-content-container">
          {activeContentItem ? (
            <>
              <a href={activeContentItem.url} target="_blank" className="ufixit-content-label flex-row justify-content-between mt-3">
                <div className="flex-column flex-center">
                  <h2 className="fake-h1">{activeContentItem.title}</h2>
                </div>
                <div className="flex-column flex-center">
                  <ExternalLinkIcon className="icon-lg link-color" />
                </div>
              </a>
              <div className="ufixit-content-preview" dangerouslySetInnerHTML={{__html: activeContentItem.body}} />
              <div className="ufixit-content-progress">
                Progress bar goes here.
              </div>
            </>
          ) : activeIssue ? (
            <>
              <h2>Loading Content...</h2>
              <div className="ufixit-content-preview" />
              <div className="ufixit-content-progress">
                Progress bar goes here.
              </div>
            </>
          ) : (
            <>
              <h2>No Issue Selected</h2>
              <div className="ufixit-content-preview" />
              <div className="ufixit-content-progress">
                Progress bar goes here.
              </div>
            </>
          )}
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