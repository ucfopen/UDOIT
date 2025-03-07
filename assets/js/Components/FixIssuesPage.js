import React, { useState, useEffect } from 'react';
import FixIssuesFilters from './FixIssuesFilters';
import FixIssuesList from './FixIssuesList';
import FixIssuesContentPreview from './FixIssuesContentPreview';
import UfixitWidget from './UfixitWidget'
import * as Html from '../Services/Html'
import Api from '../Services/Api'
import './FixIssuesPage.css'

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
  activeTasks,
  updateTask,
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

  const [activeIssue, setActiveIssue] = useState(null)
  const [activeContentItem, setActiveContentItem] = useState(null)
  const [editedElement, setEditedElement] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState(defaultFilters)
  const [unfilteredIssues, setUnfilteredIssues] = useState([])
  const [filteredIssues, setFilteredIssues] = useState([])
  const [widgetState, setWidgetState] = useState(WIDGET_STATE.LOADING)
  const [viewInfo, setViewInfo] = useState(false)
  const [isSaving, setIsSaving] = useState(true)

  // The database stores and returns certain issue data, but it needs additional attributes in order to
  // be really responsive on the front end. This function adds those attributes and stores the database
  // information in the "issue" attribute.
  const formatIssueData = (issue) => {

    let issueSeverity = FILTER.ISSUE
    // PHPAlly returns a type of 'error' or 'suggestion'
    if(issue.type == 'suggestion') {
      issueSeverity = FILTER.SUGGESTION
    }
    
    let issueContentType = FILTER.ALL
    let issueSectionIds = []

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
      /* TODO: Find a more consistent way to filter this that works with less bespoke data.
        In Canvas, the modules and moduleItems have names and links, but do not have the
        contentItemId, which is necessary to match the issue to the content. The only current
        data that matches are the moduleItem's page_url are the contentItem's lmsContentId,
        which are both the same internal link URL. */
      if(sections && sections.length > 0) {
        sections.forEach((section) => {
          let tempSectionId = section.id
          section.items.forEach((item) => {
            if(item.page_url === tempContentItem.lmsContentId) {
              issueSectionIds.push(tempSectionId.toString())
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
      sectionIds: issueSectionIds,
      keywords: createKeywords(issue, tempContentItem),
      scanRuleLabel: t(`rule.label.${issue.scanRuleId}`),
      contentId: tempContentItem.lmsContentId,
      contentType: issueContentType,
      contentTypeLabel: t(`content.${tempContentItem.contentType}`),
      contentTitle: tempContentItem.title,
      contentUrl: tempContentItem.url,
      
    }
  }

  // Call the formatIssueData function when the report changes to make sure every issue has all the necessary attributes
  useEffect(() => {
    let tempIssues = Object.assign({}, report.issues)
    let tempFormattedIssues = []

    for (const [key, value] of Object.entries(tempIssues)) {
      let issue = formatIssueData(value)
      tempFormattedIssues.push(issue)
    }

    tempFormattedIssues.sort((a, b) => {
      return (a.contentTypeLabel.toLowerCase() < b.contentTypeLabel.toLowerCase()) ? -1 : 1
    })

    setUnfilteredIssues(tempFormattedIssues)
  }, [report])

  // The initialSeverity prop is used when clicking a "Fix Issues" button from the main dashboard.
  useEffect(() => {
    let tempSeverity = initialSeverity || FILTER.ALL
    setActiveFilters(Object.assign({}, defaultFilters, {[FILTER.TYPE.SEVERITY]: tempSeverity}))
  }, [initialSeverity])

  const getFilteredContent = () => {
    let filteredList = [];
    const tempFilters = Object.assign({}, activeFilters);

    // PHPAlly Issues have a 'type' of 'error' or 'suggestion'
    // // Check for easy issues filter
    // if (tempFilters.easyIssues && tempFilters.issueTitles.length == 0) {
    //   tempFilters.issueTitles = easyRules
    // }
    // Loop through the issues

    for (const issue of unfilteredIssues) {

      // Do not include this issue if it doesn't match the severity filter
      if (tempFilters[FILTER.TYPE.SEVERITY] !== FILTER.ALL && tempFilters[FILTER.TYPE.SEVERITY] !== issue.severity) {
        continue;
      }

      // Do not include this issue if it doesn't match the content type filter
      if (tempFilters[FILTER.TYPE.CONTENT_TYPE] !== FILTER.ALL && tempFilters[FILTER.TYPE.CONTENT_TYPE] !== issue.contentType) {
        continue;
      }

      // Do not include this issue if it doesn't match the status filter
      if (tempFilters[FILTER.TYPE.RESOLUTION] !== FILTER.ALL && tempFilters[FILTER.TYPE.RESOLUTION] !== issue.status) {
        continue;
      }

      // Do not include this issue if it doesn't match the module filter
      if (tempFilters[FILTER.TYPE.MODULE] !== FILTER.ALL && !issue.sectionIds.includes(tempFilters[FILTER.TYPE.MODULE].toString())) {
        continue;
      }

      // Do not include this issue if it doesn't contain the search term/s
      if (searchTerm !== '') {
        const searchTerms = searchTerm.toLowerCase().split(' ');
        let containsAllTerms = true
        if (Array.isArray(searchTerms)) {
          for (let term of searchTerms) {
            if (!issue.keywords.includes(term)) {
              containsAllTerms = false
            }
          }
        }
        if (!containsAllTerms) {
          continue
        }
      }

      // If the issue passes all filters, add it to the list!
      filteredList.push(issue)
    }

    filteredList.sort((a, b) => {
      return (a.contentTypeLabel.toLowerCase() < b.contentTypeLabel.toLowerCase()) ? -1 : 1
    })

    return filteredList
  }

  // When the filters or search term changes, update the filtered issues list
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

  // When the activeIssue changes, check if it's already in the activeTasks list
  useEffect(() => {

    if(activeIssue === null || activeTasks.length === 0) {
      setIsSaving(false)
      return
    }

    // See if this issue is already in the activeTasks list
    let tempTask = activeTasks.find((task) => task.id === activeIssue.id)
    if(tempTask) {
      setIsSaving(true)
    }
    else {
      setIsSaving(false)
    }

  }, [activeIssue, activeTasks])    


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

  const handleIssueResolve = () => {
    
    if (!activeIssue) { return }
    
    for(let i = 0; i < activeTasks.length; i++) {
      if(activeTasks[i].id === activeIssue.id) {
        return
      }
    }

    updateTask(activeIssue.id, 'resolve')

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
            // update activeIssue locally
            updateTask(newIssue.id)
            updateIssue(newIssue)
            handleIssueSave(newIssue, res.data)
          })
        }
        else {
          updateTask(tempIssue.id)
          updateIssue(tempIssue)
        }
      })
    updateIssue(tempIssue)
  }

  const updateActiveFilters = (filter, value) => {
    setActiveFilters(Object.assign({}, activeFilters, {[filter]: value}));
  }

  const nextIssue = (previous = false) => {
    if (!activeIssue || filteredIssues.length === 0) { return }

    let activeIndex = filteredIssues.findIndex((issue) => issue.id === activeIssue.id);

    if(activeIndex === -1) { return }

    // If we've reached the first or last issue, loop around
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

  return (
    <>
      <FixIssuesFilters
        t={t}
        settings={settings.FILTER ? settings : Object.assign({}, settings, { FILTER })}
        sections={sections}
        activeFilters={activeFilters}
        updateActiveFilters={updateActiveFilters}
        searchTerm={searchTerm}
        handleSearchTerm={setSearchTerm}
      />
      <div className="ufixit-page-divider">
        <section className="ufixit-widget-container">
          { widgetState === WIDGET_STATE.LIST ? (
            <FixIssuesList
              t={t}
              settings={settings.FILTER ? settings : Object.assign({}, settings, { FILTER })}
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
                setEditedElement={setEditedElement}
                formatIssueData={formatIssueData}
                handleIssueResolve={handleIssueResolve}
                handleIssueSave={handleIssueSave}
                toggleListView={toggleListView}
                listLength={filteredIssues.length}
                nextIssue={nextIssue}
                isSaving={isSaving}
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
            editedElement={editedElement}
          />
        </section>
      </div>
    </>
  )
}