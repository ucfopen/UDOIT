import React, { useState } from 'react'
import UpArrowIcon from '../Icons/UpArrowIcon'
import DownArrowIcon from '../Icons/DownArrowIcon'
import './FixIssuesContentPreview.css'

export default function ScrollButton({
  t,

  scrollToError
}) {
    
  return (
    <div className='scroll-to-error-container'>
      <button
        id='scroll-to-error-up'
        className='btn-secondary btn-icon-right btn-small scroll-to-error'
        onClick={scrollToError}
        tabIndex='0'
      >
        {t('fix.button.scroll_to_issue')}
        <UpArrowIcon className="icon-sm" />
      </button>
      
      <button
        id='scroll-to-error-down'
        className='btn-secondary btn-icon-right btn-small scroll-to-error'
        onClick={scrollToError}
        tabIndex='0'
      >
        {t('fix.button.scroll_to_issue')}
        <DownArrowIcon className="icon-sm" />
      </button>
    </div>
  )
}