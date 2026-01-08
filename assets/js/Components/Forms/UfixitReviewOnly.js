import React, { useEffect, useState } from 'react'
import FormExternalLink from './FormExternalLink'
import FormReviewOnly from './FormReviewOnly'

export default function UfixitReviewOnly({
  t,
  settings, 
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
        settings={settings}
        activeIssue={activeIssue}
      />
      <FormReviewOnly
        t={t}
        settings={settings}
        activeIssue={activeIssue}
        handleIssueSave={handleIssueSave}
        isContentLoading={isContentLoading}
        markAsReviewed={markAsReviewed}
        setMarkAsReviewed={setMarkAsReviewed}
      />
    </div>
  )
}