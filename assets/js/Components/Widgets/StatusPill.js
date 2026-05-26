import React from 'react'

import SeverityIcon from '../Icons/SeverityIcon'
import SeverityPotentialIcon from '../Icons/SeverityPotentialIcon'
import ResolvedIcon from '../Icons/ResolvedIcon'
import FixedIcon from '../Icons/FixedIcon'

export default function StatusPill({
  t,
  settings,
  issue,
}) {

  return (
    <>
      { issue.status === settings.ISSUE_FILTER.ACTIVE ? (
        <div aria-label={t(`filter.label.severity.${issue.severity.toLowerCase()}_single`)} className={`info-pill ml-2 ` + issue.severity.toLowerCase()}>
          <SeverityIcon type={issue.severity} className="icon-md flex-column align-self-center"  aria-hidden="true"/>
          <div aria-hidden="true" className="info-pill-text">{t(`filter.label.severity.${issue.severity.toLowerCase()}_single`)}</div>
        </div>
      ) : (issue.status === settings.ISSUE_FILTER.FIXED || issue.status == settings.ISSUE_FILTER.FIXEDANDRESOLVED) ? (
        <div aria-label={t('filter.label.resolution.fixed_single')} className="info-pill fixed ml-2">
          <FixedIcon className="color-success icon-md flex-column align-self-center" aria-hidden="true"/>
          <div aria-hidden="true" className="info-pill-text">{t('filter.label.resolution.fixed_single')}</div>
        </div>
      ) : (issue.status === settings.ISSUE_FILTER.RESOLVED) ? (
        <div aria-label={t('filter.label.resolution.resolved_single')} className="info-pill fixed ml-2">
          <ResolvedIcon className="color-success icon-md flex-column align-self-center" aria-hidden="true"/>
          <div aria-hidden="true" className="info-pill-text">{t('filter.label.resolution.resolved_single')}</div>
        </div>
      ) : (issue.status === settings.FILE_FILTER.UNREVIEWED) ? (
        <div aria-label={t('filter.label.resolution.fixed_single')} className="info-pill unreviewed ml-2">
          <SeverityPotentialIcon className="color-potential icon-md flex-column align-self-center" aria-hidden="true"/>
          <div aria-hidden="true" className="info-pill-text">{t('fix.label.status.unreviewed')}</div>
        </div>
      ) : (issue.status === settings.FILE_FILTER.REVIEWED) ? (
        <div aria-label={t('filter.label.resolution.resolved_single')} className="info-pill reviewed ml-2">
          <ResolvedIcon className="color-success icon-md flex-column align-self-center" aria-hidden="true"/>
          <div aria-hidden="true" className="info-pill-text">{t('fix.label.status.reviewed')}</div>
        </div>
      ) : ''}
    </>
  )
}