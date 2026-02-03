import React, { useState, useEffect, useRef } from 'react'
import ProgressIcon from '../Icons/ProgressIcon'
import FixedIcon from '../Icons/FixedIcon'
import InfoIcon from '../Icons/InfoIcon'
import SeverityIssueIcon from '../Icons/SeverityIssueIcon'
import SeverityPotentialIcon from '../Icons/SeverityPotentialIcon'
import CloseIcon from '../Icons/CloseIcon'

export default function Message ({
  t,
  settings,
  messageObject,
  pauseTimer,
  resumeTimer,
  removeMessage
}) {

  const ref = useRef()
  const [isPaused, setIsPaused] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const htmlElement = ref.current
    htmlElement.style.transform = "translateX(calc(100% + 20px))"

    requestAnimationFrame(() => {
      htmlElement.style.transition = "transform 0.5s cubic-bezier(0.68, -0.55, 0.25, 1.35)"
      htmlElement.style.transform = "translateX(0)"
      setIsOpen(true)
    });

    handleResume()
  }, []);

  const handleClose = () => {
    setIsOpen(false)
    removeMessage(messageObject.id)
  }

  const handlePause = () => {
    setIsPaused(true)
    pauseTimer(messageObject.id)
  }

  const handleResume = () => {

    let tempTimer = settings?.user?.roles?.alert_timeout || "5000"
    if (tempTimer === 'none') {
      return
    }
    setIsPaused(false)
    resumeTimer(messageObject.id)
  }

  const statusMap = {
    'success': <FixedIcon className="icon-lg primary" alt="" />,
    'info': <InfoIcon className="icon-lg color-info" alt="" />,
    'error': <SeverityIssueIcon className="icon-lg color-issue" alt="" />,
    'alert': <SeverityPotentialIcon className="icon-lg color-potential" alt="" />,
    'progress': <ProgressIcon className="icon-lg udoit-suggestion spinner" alt="" />
  }

  return (
    <div
      ref={ref}
      data-id={messageObject.id}
      className={`messageItemContainer flex-column ${messageObject.severity} ${isOpen ? 'open' : ''}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={() => handlePause()}
      onMouseLeave={() => handleResume()}
      >
        <div className="messageTrayItem flex-row gap-2">
          <div className="flex-column justify-content-start">
            {statusMap[messageObject.severity]}
          </div>
          <div className="flex-column justify-content-center">
            {t(messageObject.message)}
          </div>
        </div>
      <button
        className="flex-column justify-content-center closeButton"
        onClick={() => handleClose()}
        tabIndex="0"
        aria-label={t('label.close_message')}
        title={t('label.close_message')}>
        <CloseIcon className="icon-sm text-color" />
      </button>
      { settings?.user?.roles?.alert_timeout !== 'none' && (
        <div className="messageTrayAnimatedBorderContainer">
          <div className={`messageTrayAnimatedBorder ${messageObject.id} ${messageObject.severity} ${!isPaused ? `ms${settings?.user?.roles?.alert_timeout}` : ''}`}/>
        </div>
      ) }
    </div>
  )
}