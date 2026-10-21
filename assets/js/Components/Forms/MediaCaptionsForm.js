import React, { useState } from 'react'
import FormExternalLink from './FormExternalLink'

export default function MediaCaptionsForm({
  t,
  instanceInfo,
  activeIssue
}) {

  let baseUrl = '';
  if (activeIssue?.contentUrl) {
    try {
      const urlObj = new URL(activeIssue.contentUrl);
      baseUrl = urlObj.origin;
    } catch (e) {
      baseUrl = '';
    }
  }

  // Extract video path from initialHtml
  let initialMatch = null;
  let initialVideoUrl = null;
  if (activeIssue?.initialHtml) {
    const match = activeIssue.initialHtml.match(/<source\s+src=["']([^"']+)["']/i);
    if (match) {
      initialMatch = match[1];
      if (baseUrl && initialMatch.startsWith('/')) {
        initialVideoUrl = baseUrl + initialMatch;
      } else {
        initialVideoUrl = initialMatch;
      }
    }
  }

  return (
    <div className="flex-column">
      <div dangerouslySetInnerHTML={{__html: t('form.review_only.summary')}}></div>
      <FormExternalLink
        t={t}
        instanceInfo={instanceInfo}
        activeIssue={activeIssue}
      />
    </div>
  )
}