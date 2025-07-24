import React, { useEffect, useState } from 'react'
import { findEditURLWithIssue } from '../../Services/Settings'
import FormExternalLink from './FormExternalLink'

export default function UfixitReviewOnly({
  t, 
  settings, 
  activeIssue, 
  handleIssueSave, 
  addMessage, 
  handleActiveIssue
}) {

  return (
    <div className="flex-column">
      <div dangerouslySetInnerHTML={{__html: t('form.review_only.summary')}}></div>
      <FormExternalLink
        t={t}
        settings={settings}
        activeIssue={activeIssue}
      />
    </div>
  )
}