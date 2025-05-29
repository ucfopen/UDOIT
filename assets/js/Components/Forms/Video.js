import React from 'react'

export default function Video({
  t,
  activeIssue,
  isDisabled
}) {

  const handleVideoRescan = () => {
    // handleManualScan(activeIssue)
    console.log('Video rescan triggered for issue:', activeIssue.id)
  }

  return (
    <>
      <h3>{t('form.video.label.videos')}</h3>
      <p>{t('form.video.label.description')}</p>
      <button
        className="btn btn-primary"
        tabindex="0"
        disabled={isDisabled}
        onClick={handleVideoRescan}>
        {t('form.video.button.scan_video')}
      </button>
    </>
  )
}
