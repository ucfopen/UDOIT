import React, { useState } from 'react'
import FormExternalLink from './FormExternalLink'
import MediaCaptionsEditor from '../Captions/MediaCaptionsEditor'

export default function MediaCaptionsForm({
  t,
  settings,
  activeIssue,
  isDisabled
}) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex-column">
      <div dangerouslySetInnerHTML={{__html: t('form.review_only.summary')}}></div>
      <FormExternalLink
        t={t}
        settings={settings}
        activeIssue={activeIssue}
      />
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setShowModal(true)}
      >
        {t('form.media_captions.open_editor') || 'Open Captions Editor'}
      </button>
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 8,
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <button
              type="button"
              style={{ float: 'right' }}
              onClick={() => setShowModal(false)}
            >
              {t('Close') || 'Close'}
            </button>
            <MediaCaptionsEditor t={t} />
          </div>
        </div>
      )}
    </div>
  )
}