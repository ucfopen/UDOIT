import React, {useState, useEffect} from 'react'

import ContentTypeIcon from '../Icons/ContentTypeIcon'
import SeverityIcon from '../Icons/SeverityIcon'
import ResolvedIcon from '../Icons/ResolvedIcon'
import FixedIcon from '../Icons/FixedIcon'
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
                tabIndex="0">
                <h3 className="allow-word-break align-self-center">{group.formLabel}</h3>
                <div className="flex-row justify-content-end flex-shrink-0 gap-3">
                  <div className="ufixit-list-heading-count align-self-center">
                    { group.issues.length !== 1 ? t('filter.label.issue_count_plural', { count: group.issues.length }) : t('filter.label.issue_count_single')}
                  </div>
                  <div className="flex-column align-self-center">
                    <SortIcon className={`expand-icon icon-xl primary ${openList[group.formLabel] ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
              <div className={`ufixit-list-items-container ${openList[group.formLabel] ? 'open' : 'closed'}`}
                tabIndex="-1">
                { group.issues.map((issue, j) => {
                  return (
                    <div
                      className="ufixit-list-item flex-row justify-content-between"
                      key={j}
                      onClick={() => setActiveIssue(issue)}
                      onKeyDown={(event) => {
                        if(event.key === 'Enter' || event.key === ' ') {
                          setActiveIssue(issue)
                        }
                      }}
                      tabIndex={openList[group.formLabel] ? '0' : '-1'} >
                      <div className="flex-grow-1 flex-column justify-content-center allow-word-break list-item-title">
                        {issue.contentTitle}
                      </div>
                      <div className="flex-row">
                        <div alt="" title={t(`filter.label.type.${issue.contentType.toLowerCase()}_single`)} className="data-pill flex-row ml-2">
                          <ContentTypeIcon type={issue.contentType} className="gray icon-md flex-column align-self-center"/>
                          <div className="data-pill-text">{t(`filter.label.type.${issue.contentType.toLowerCase()}_single`)}</div>
                        </div>
                        { issue.status === settings.FILTER.ACTIVE && (
                          <div alt="" title={t(`filter.label.severity.${issue.severity.toLowerCase()}_single`)} className="data-pill flex-row ml-2">
                            <SeverityIcon type={issue.severity} className="icon-md flex-column align-self-center" />
                            <div className="data-pill-text">{t(`filter.label.severity.${issue.severity.toLowerCase()}_single`)}</div>
                          </div>
                        )}
                        { issue.status === settings.FILTER.RESOLVED && (
                          <div alt="" title={t('filter.label.resolution.resolved_single')} className="data-pill fixed flex-row ml-2">
                            <ResolvedIcon className="color-success icon-md flex-column align-self-center"/>
                            <div className="data-pill-text">{t('filter.label.resolution.resolved_single')}</div>
                          </div>
                        )}
                        { (issue.status === settings.FILTER.FIXED || issue.status == settings.FILTER.FIXEDANDRESOLVED) && (
                          <div alt="" title={t('filter.label.resolution.fixed_single')} className="data-pill fixed flex-row ml-2">
                            <FixedIcon className="color-success icon-md flex-column align-self-center"/>
                            <div className="data-pill-text">{t('filter.label.resolution.fixed_single')}</div>
                          </div>
                        )}
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