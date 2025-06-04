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

  const checkForCaptions = async () => {
    const apiKey = process.env.REACT_APP_CAPTIONHUB_API_KEY;
    const apiEndpoint = process.env.REACT_APP_CAPTIONHUB_API_ENDPOINT;

    if (!apiKey || !apiEndpoint) {
      console.error('API key or endpoint not defined in environment variables.');
      return;
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiKey}`
        },
        body: JSON.stringify({ issueId: activeIssue.id })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response:', data);
    } catch (error) {
      console.error('Error fetching captions:', error);
    }
  }

  return (
    <>
      <h3>{t('form.video.label.videos')}</h3>
      <p>{t('form.video.label.description')}</p>
      <button
        className="btn btn-primary"
        tabindex="0"
        disabled={isDisabled}
        onClick={checkForCaptions}>
        {t('form.video.button.scan_video')}
      </button>
    </>
  )
}
