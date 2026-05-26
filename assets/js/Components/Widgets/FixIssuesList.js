import React, {useState, useEffect} from 'react'

import ContentTypeIcon from '../Icons/ContentTypeIcon'
import StatusPill from './StatusPill'
import SortIcon from '../Icons/SortIcon'

import './FixIssuesList.css'

export default function FixIssuesList({
  t,
  settings,
  
  groupedList,
  setActiveIssue
}) {

  const [openList, setOpenList] = useState([])

  useEffect(() => {
    const tempList = {...openList}
    if (groupedList && groupedList.length > 0) {
      for(let i = 0; i < groupedList.length; i++) {
        if(!tempList[groupedList[i].formLabel]) {
          tempList[groupedList[i].formLabel] = false
        }
      }
    }
    setOpenList(tempList)
  }
  , [groupedList])

  /* Aria Label for items is SEVERITY, CONTENT TYPE, CONTENT TITLE, MODULE(S). For example,
     "Known Barrier, Page, 'Welcome to the course', found in: 'Introduction Module' */
  const getIssueLabel = (issue) => {
    let label = ''
    if(issue.status === settings.ISSUE_FILTER.ACTIVE) {
      label += t(`filter.label.severity.${issue.severity.toLowerCase()}_single`) + ', '
    }
    else if (issue.status === settings.ISSUE_FILTER.FIXED || issue.status == settings.ISSUE_FILTER.FIXEDANDRESOLVED) {
      label += t('filter.label.resolution.fixed_single') + ', '
    }
    else if (issue.status === settings.ISSUE_FILTER.RESOLVED) {
      label += t('filter.label.resolution.resolved_single') + ', '
    }

    label += t(`filter.label.type.${issue.contentType.toLowerCase()}_single`) + ', '

    label += issue.contentTitle + ', '

    if(issue.sectionNames.length > 0) {
      label += t('fix.label.found_in') + ' ' + issue.sectionNames.join(', ')
    }
    else {
      label += t('fix.label.no_references')
    }

    return label
  }

  const toggleGroup = (group) => {
    const groupLabel = group.formLabel
    const updatedList = {...openList, [groupLabel]: !openList[groupLabel]}
    setOpenList(updatedList)
  }

  return (
    <div className="ufixit-list-container flex-column">
      <div className="ufixit-list-scrollable flex-grow-1" tabIndex="-1">
        { groupedList.length > 0 ? groupedList.map((group, i) => {
          return (
            <div className={`ufixit-list-section-container ${openList[group.formLabel] ? 'open' : 'closed'}`} key={i}>
              <div className={`ufixit-list-heading flex-row gap-3 justify-content-between ${openList[group.formLabel] ? 'open' : 'closed'}`}
                onClick={() => toggleGroup(group)}
                onKeyDown={(event) => {
                  if(event.key === 'Enter' || event.key === ' ') {
                    toggleGroup(group)
                  }
                }}
                aria-label={`${ (group.issues.length === 1 ? t('filter.label.issue_count_single') : t('filter.label.issue_count_plural', {count: group.issues.length}))} - ${group.formLabel}`}
                aria-controls={`list-items-${i}`}
                aria-expanded={openList[group.formLabel] ? 'true' : 'false'}
                role="button"
                tabIndex="0">
                <div className="flex-row gap-2" aria-hidden="true">
                  <div className="ufixit-list-heading-counter">
                    { group.issues.length }
                  </div>
                  <h3 className="allow-word-break">{group.formLabel}</h3>
                </div>
                <div className="flex-column align-self-center" aria-hidden="true">
                  <SortIcon className={`expand-icon icon-lg gray ${openList[group.formLabel] ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <div
                id={`list-items-${i}`}
                className={`ufixit-list-items-container ${openList[group.formLabel] ? 'open' : 'closed'}`}
                aria-hidden={openList[group.formLabel] ? 'false' : 'true'}
                tabIndex="-1">
                { group.issues.map((issue, j) => {
                  return (
                    <div
                      id={`issue-item-${issue.id}`}
                      className="ufixit-list-item flex-row justify-content-between gap-3"
                      key={j}
                      onClick={() => setActiveIssue(issue)}
                      onKeyDown={(event) => {
                        if(event.key === 'Enter' || event.key === ' ') {
                          setActiveIssue(issue)
                        }
                      }}
                      /* Label is SEVERITY, CONTENT TYPE, CONTENT TITLE, MODULE(S). For example,
                         "Known Barrier, Page, 'Welcome to the course', found in: 'Introduction Module' */
                      aria-label={getIssueLabel(issue)}
                      role="link"
                      tabIndex={openList[group.formLabel] ? '0' : '-1'}>
                        <div className="flex-row gap-2" aria-hidden="true">
                          <div className="ufixit-list-content-type-icon-container">
                            <ContentTypeIcon type={issue.contentType} className="gray icon-md"/>
                          </div>
                          <div className="flex-column justify-content-center">
                            <div className="list-item-title">
                              {issue.contentTitle}
                            </div>
                            <div className="list-item-subtitle">
                              {issue.sectionNames.length > 0 ? (issue.sectionNames.join(', ')) : t('fix.label.no_references')}
                            </div>
                          </div>
                        </div>
                      <div className="flex-row" aria-hidden="true">
                        <StatusPill
                          t={t}
                          settings={settings}
                          issue={issue}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }) : (
          <div className="flex-column gap-3 mt-3">
            <div className="flex-row align-self-center ms-3 me-3">
              <h2 className="mt-0 mb-0 primary-dark">{t('report.label.no_results')}</h2>
            </div>
            <div className="flex-row align-self-center ms-3 me-3">
              {t('report.msg.no_results')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}