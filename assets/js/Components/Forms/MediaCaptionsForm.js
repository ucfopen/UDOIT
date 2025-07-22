import React from 'react'

export default function MediaCaptionsForm({
  t,
  activeIssue,
  isDisabled
}) {

  const handleVideoRescan = () => {
    // handleManualScan(activeIssue)
    console.log('Video rescan triggered for issue:', activeIssue.id)
  }

  const checkForCaptions = () => {
    
  }

  return (
    <>
      <h3>{t('form.media_captions.label.videos')}</h3>
      <p>{t('form.media_captions.label.description')}</p>
      {/* <button
        className="btn btn-primary"
        tabIndex="0"
        disabled={isDisabled}
        onClick={checkForCaptions}>
        {t('form.media_captions.button.scan_video')}
      </button> */}
    </>
  )
}
