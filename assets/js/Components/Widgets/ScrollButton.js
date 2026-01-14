import React, { useState } from 'react'
import UpArrowIcon from '../Icons/UpArrowIcon'
import DownArrowIcon from '../Icons/DownArrowIcon'
import './FixIssuesContentPreview.css'

export default function ScrollButton({
  t,

  isIssueElementVisible,
  debouncedDirection,
  scrollToElement
}) {
    
  return (
    <div
      className='scroll-to-error-container'
      style={!(!isIssueElementVisible && debouncedDirection) ? { display: 'none' } : {}} 
      aria-hidden={!(!isIssueElementVisible && debouncedDirection) ? "true" : "false"}>
      <button
        className={`btn-secondary btn-icon-right btn-small scroll-to-error ${debouncedDirection ? 'scroll-to-error-' + debouncedDirection : ''}`}
        onClick={() => scrollToElement(document.getElementsByClassName('ufixit-error-highlight')[0])}
        tabIndex={!(!isIssueElementVisible && debouncedDirection) ? "-1" : "0"}
      >
        {t('fix.button.scroll_to_issue')}
        { debouncedDirection === 'up' ?
          <UpArrowIcon className="icon-sm" />
        : debouncedDirection === 'down' ?
          <DownArrowIcon className="icon-sm" />
        : null
        }
      </button>
    </div>
  )
}