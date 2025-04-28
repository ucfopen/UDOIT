import React, { useState, useEffect } from 'react'
import ProgressIcon from './Icons/ProgressIcon'
import FixedIcon from './Icons/FixedIcon'
import InfoIcon from './Icons/InfoIcon'
import SeverityIssueIcon from './Icons/SeverityIssueIcon'
import SeverityPotentialIcon from './Icons/SeverityPotentialIcon'
import CloseIcon from './Icons/CloseIcon'

import './MessageTray.css'

export default function MessageTray ({ messages, hasNewReport, clearMessages, t }) {

  const [isOpen, setIsOpen] = useState(false)
  const [timerInt, setTimerInt] = useState(null)

  useEffect(() => {
    clearMessages()
  }, [])

  useEffect(() => {
    if(timerInt) {
      clearInterval(timerInt)
      setTimerInt(null)
    }
    if (messages.length > 0) {
      setIsOpen(true)
      setTimerInt(setTimeout(() => {
        handleClose()
      }, 5000))
    }
  }, [messages])

  const handleClose = () => {
    setIsOpen(false)
  }

  const statusMap = {
    'success': <FixedIcon className="icon-lg primary" alt="" />,
    'info': <InfoIcon className="icon-lg link-color" alt="" />,
    'error': <SeverityIssueIcon className="icon-lg color-issue" alt="" />,
    'alert': <SeverityPotentialIcon className="icon-lg color-potential" alt="" />,
  }

  return (
    <div className={`messageTrayContainer ${isOpen ? 'open' : ''}`} role="alert" aria-live="polite" aria-atomic="true">
      <div className='messageTray flex-column'>
        {!hasNewReport && (
          <div className='messageTrayItem flex-row gap-2'>
            <div className="flex-column justify-content-center">
              <ProgressIcon className="icon-lg primary spinner" alt=""/>
            </div>
            <div className="flex-column justify-content-center">
              {t('msg.content_loading')}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div className='messageTrayItem flex-row gap-2' key={`msg${i}`}>
            <div className="flex-column justify-content-center">
              {statusMap[msg.severity]}
            </div>
            <div className="flex-column justify-content-center">
              {t(msg.message)}
            </div>
          </div>
        ))}
        <button className="btn btn-text closeButton" onClick={() => handleClose()} aria-label={t('label.close')} title={t('label.close')}>
          <CloseIcon className="primary-dark" />
        </button>
      </div>

    </div>
  )
}