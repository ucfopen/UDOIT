import React from 'react'

import ContentTypeIcon from './Icons/ContentTypeIcon'
import SeverityIcon from './Icons/SeverityIcon'
import ResolvedIcon from './Icons/ResolvedIcon'
import FixedIcon from './Icons/FixedIcon'

import './FixIssuesList.css'

export default function FixIssuesList({ t, settings, groupedList, setActiveIssue }) {

  return (
    <div className="ufixit-list-container flex-column">
      <div className="ufixit-list-scrollable flex-grow-1" tabindex="-1">
        { groupedList.length > 0 ? groupedList.map((group, i) => {
          return (
            <div className="ufixit-list-section-container" key={i}>
              <div className="ufixit-list-heading allow-word-break">
                <h3>{group.formLabel}</h3>
              </div>
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
                    tabindex="0" >
                    <div className="flex-grow-1 flex-column justify-content-center allow-word-break list-item-title">
                      {issue.contentTitle}
                    </div>
                    <div className="flex-row">
                      <div alt="" title={t(`filter.label.type.${issue.contentType.toLowerCase()}_single`)} className="data-pill flex-row ml-2">
                        <ContentTypeIcon type={issue.contentType} className="gray icon-sm flex-column align-self-center me-1"/>
                        <div>{t(`filter.label.type.${issue.contentType.toLowerCase()}_single`)}</div>
                      </div>
                      { issue.status === settings.FILTER.ACTIVE && (
                        <div alt="" title={t(`filter.label.severity.${issue.severity.toLowerCase()}_single`)} className="data-pill flex-row ml-0">
                          <SeverityIcon type={issue.severity} className="icon-sm flex-column align-self-center me-1" />
                          <div>{t(`filter.label.severity.${issue.severity.toLowerCase()}_single`)}</div>
                        </div>
                      )}
                      { issue.status === settings.FILTER.RESOLVED && (
                        <div alt="" title={t('filter.label.resolution.resolved_single')} className="data-pill fixed flex-row ml-0">
                          <ResolvedIcon className="color-success icon-sm flex-column align-self-center me-1"/>
                          <div>{t('filter.label.resolution.resolved_single')}</div>
                        </div>
                      )}
                      { (issue.status === settings.FILTER.FIXED || issue.status == settings.FILTER.FIXEDANDRESOLVED) && (
                        <div alt="" title={t('filter.label.resolution.fixed_single')} className="data-pill fixed flex-row ml-0">
                          <FixedIcon className="color-success icon-sm flex-column align-self-center me-1"/>
                          <div>{t('filter.label.resolution.fixed_single')}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
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