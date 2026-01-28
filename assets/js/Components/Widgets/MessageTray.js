import React, { useState, useEffect } from 'react'
import ProgressIcon from '../Icons/ProgressIcon'
import FixedIcon from '../Icons/FixedIcon'
import InfoIcon from '../Icons/InfoIcon'
import SeverityIssueIcon from '../Icons/SeverityIssueIcon'
import SeverityPotentialIcon from '../Icons/SeverityPotentialIcon'
import CloseIcon from '../Icons/CloseIcon'

import './MessageTray.css'

export default function MessageTray ({
  t,
  settings,
  messages,
  clearMessages,
}) {

  const [isOpen, setIsOpen] = useState(false)
  const [timerInt, setTimerInt] = useState(null)
  const [localMessages, setLocalMessages] = useState([])

  useEffect(() => {
    clearMessages()
  }, [])

  useEffect(() => {
    let tempTimer = settings?.user?.roles?.alert_timeout || "5000"
    if(timerInt) {
      clearInterval(timerInt)
      setTimerInt(null)
    }
    if (messages.length > 0) {
      setIsOpen(true)
      setLocalMessages([...messages])
      if (timerInt) {
        clearInterval(timerInt)
      }
      if (tempTimer !== 'none') {
        setTimerInt(setTimeout(() => {
          handleClose()
        }, tempTimer))
      }
    }
    else {
      setIsOpen(false)
      setLocalMessages([])
    }
  }, [messages])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      clearMessages()
    }, 500)
  }

  const pauseTimer = () => {
    if (timerInt) {
      clearInterval(timerInt)
      setTimerInt(null)
    }
  }

  const resumeTimer = () => {
    let tempTimer = settings?.user?.roles?.alert_timeout || "5000"
    if (tempTimer === 'none') {
      return
    }
    if (!timerInt && messages.length > 0) {
      setTimerInt(setTimeout(() => {
        handleClose()
      }, tempTimer))
    }
  }

  const statusMap = {
    'success': <FixedIcon className="icon-lg primary" alt="" />,
    'info': <InfoIcon className="icon-lg color-info" alt="" />,
    'error': <SeverityIssueIcon className="icon-lg color-issue" alt="" />,
    'alert': <SeverityPotentialIcon className="icon-lg color-potential" alt="" />,
    'progress': <ProgressIcon className="icon-lg udoit-progress spinner" alt="" />
  }

  return (
    <div
      className={`messageTrayContainer ${isOpen ? 'open' : ''} ${localMessages[0]?.severity}`} 
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      >
      <div className='messageTray flex-column'>
        {localMessages.map((msg, i) => (
          <div className='messageTrayItem flex-row gap-2' key={`msg${i}`}>
            <div className="flex-column justify-content-start">
              {statusMap[msg.severity]}
            </div>
            <div className="flex-column justify-content-center">
              {t(msg.message)}
            </div>
          </div>
        ))}
        <button
          className="flex-column justify-content-center closeButton"
          onClick={() => handleClose()}
          tabIndex={isOpen ? '0' : '-1'}
          aria-label={t('label.close_message')}
          title={t('label.close_message')}>
          <CloseIcon className="icon-sm text-color" />
        </button>
      </div>
      { settings?.user?.roles?.alert_timeout !== 'none' && (
        <div className="messageTrayAnimatedBorderContainer">
          <div className={`messageTrayAnimatedBorder ${localMessages[0]?.severity} ${timerInt ? `ms${settings?.user?.roles?.alert_timeout}` : ''}`}/>
        </div>
      ) }
    </div>
  )
}