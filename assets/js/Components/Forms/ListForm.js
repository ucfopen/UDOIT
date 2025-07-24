import React, { useEffect, useState } from 'react'
import FormExternalLink from './FormExternalLink'

export default function ListForm({
  t,
  settings,
  activeIssue,
  activeContentItem,
  handleIssueSave,
  isDisabled,
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