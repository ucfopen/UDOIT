import React from 'react'
import FormExternalLink from './FormExternalLink'

export default function MediaCaptionsForm({
  t,
  settings,
  activeIssue,
  isDisabled
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
