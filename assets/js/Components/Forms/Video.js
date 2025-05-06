import React from 'react'

export default function Video({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  addMessage,
  handleActiveIssue,
  handleManualScan
}) {

  const handleVideoRescan = () => {
    handleManualScan(activeIssue)
  }

  return (
    <>
      <h3>{t('form.video.label.videos')}</h3>
      <p>{t('form.video.label.description')}</p>
      <button
        className="btn btn-primary"
        tabindex="0"
        onClick={handleVideoRescan}>
        {t('form.video.button.scan_video')}
      </button>
    </>
  )
}
