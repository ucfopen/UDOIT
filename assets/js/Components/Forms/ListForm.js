import React, { useEffect, useState } from 'react'
import FormExternalLink from './FormExternalLink'
import FormReviewOnly from './FormReviewOnly'

export default function ListForm({
  t,
  settings, 
  instanceInfo,
  activeIssue,
  isContentLoading,
  markAsReviewed,
  setMarkAsReviewed,
  handleIssueSave,
}) {
  
  return (
    <div className="flex-column">
      <div dangerouslySetInnerHTML={{__html: t('form.review_only.summary')}}></div>
      <FormExternalLink
        t={t}
        instanceInfo={instanceInfo}
        activeIssue={activeIssue}
      />
      <FormReviewOnly
        t={t}
        activeIssue={activeIssue}
        handleIssueSave={handleIssueSave}
        isContentLoading={isContentLoading}
        markAsReviewed={markAsReviewed}
        setMarkAsReviewed={setMarkAsReviewed}
      />
    </div>
  )
}