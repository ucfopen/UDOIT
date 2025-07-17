import React, { useEffect, useState } from 'react'

import ExternalLinkIcon from '../Icons/ExternalLinkIcon'

export default function UfixitReviewOnly({
  t, 
  settings, 
  activeIssue, 
  handleIssueSave, 
  addMessage, 
  handleActiveIssue
}) {

  const [editorLink, setEditorLink] = useState('')

  useEffect(() => {
    if (activeIssue) {
      let lms = settings?.institution?.lmsId
      if( lms === 'canvas') {
        setEditorLink(`${activeIssue.contentUrl}/edit`)
      }
      else {
        setEditorLink(activeIssue.contentUrl)
      }
    }
    else {
      setEditorLink('')
    }
  }, [activeIssue])

  return (
    <div className="flex-column">
      { editorLink !== '' && (<div className="mt-3 flex-row justify-content-end">
        <a href={editorLink} target="_blank" rel="noreferrer" className="flex-row gap-1">
          <span>{t('form.review_only.link.edit')}</span>
          <ExternalLinkIcon className="icon-md link-color" />
        </a>
      </div>) }
    </div>
  )
}