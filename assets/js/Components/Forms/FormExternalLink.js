import React, { useState, useEffect } from 'react'
import { findEditURLWithIssue } from '../../Services/Settings'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'

export default function FormExternalLink({
  t,
  settings,
  activeIssue
}) {

  const [editorLink, setEditorLink] = useState('')

  useEffect(() => {
    if (activeIssue) {
      setEditorLink(findEditURLWithIssue(activeIssue, settings))
    }
    else {
      setEditorLink('')
    }
  }, [activeIssue])

  return (
    <>
      { editorLink !== '' && (<div className="mt-3 flex-row justify-content-end">
        <a href={editorLink} target="_blank" rel="noreferrer" className="flex-row gap-1">
          <span>{t('form.review_only.link.edit')}</span>
          <ExternalLinkIcon className="icon-md link-color" />
        </a>
      </div>) }
    </>
  )
}