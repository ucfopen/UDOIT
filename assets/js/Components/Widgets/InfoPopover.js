import React, { useEffect, useId, useRef, useState } from 'react'
import InfoIcon from '../Icons/InfoIcon'
import CloseIcon from '../Icons/CloseIcon'
import './InfoPopover.css'

export default function InfoPopover({
  t,
  triggerAriaLabel = t('report.button.issue_tooltip'),
  title = t('fix.button.learn_more'),
  content,
  action = null,
  hoverOnly = false,
  iconClassName = 'icon-md',
}) {

  const [open, setOpen] = useState(false)
  const titleId = useId()
  const triggerRef = useRef(null)
  const dialogRef = useRef(null)
  const closeTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(closeTimerRef.current), [])

  useEffect(() => {
    const dialog = dialogRef.current
    const handleEscape = (e) => {
      if (e.key === 'Escape' && dialog.open) {
        e.preventDefault()
        e.stopPropagation()
        dialog.close()
        setOpen(false)
      }
    }

    dialog.addEventListener('keydown', handleEscape)
    return () => dialog.removeEventListener('keydown', handleEscape)
  }, [])

  const getCoords = () => {
    const margin = 16
    
    // Measure and adjust position so mouse is at bottom-left
    const rect = triggerRef.current.getBoundingClientRect()
    let newX = rect.x + rect.width + margin
    let newY = rect.y

    // Get viewport dimensions
    const vw = window.innerWidth
    const vh = window.innerHeight

    const dialog = dialogRef.current
    const dialogRect = dialog.getBoundingClientRect()
    
    // Adjust X if dialog overflows right edge
    if (newX + dialogRect.width > vw) {
      newX = vw - dialogRect.width - margin
    }
    // Adjust X if dialog overflows left edge
    if (newX < 0) {
      newX = margin
    }
    // Adjust Y if dialog overflows bottom edge
    if (newY + dialogRect.height > vh) {
      newY = vh - dialogRect.height - margin
    }
    // Adjust Y if dialog overflows top edge
    if (newY < 0) {
      newY = margin
    }

    return { x: newX, y: newY }
  }

  const openPopover = (modal) => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      modal ? dialog.showModal() : dialog.show()
      const { x, y } = getCoords()
      dialog.style.left = `${x}px`
      dialog.style.top = `${y}px`
      if (modal) dialog.focus()
      setOpen(true)
    }
  }

  const handleOpen = (e) => {
    e.preventDefault()
    e.stopPropagation()
    openPopover(true)
  }

  const handleClose = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    const dialog = dialogRef.current
    if (dialog && dialog.open) {
      dialog.close()
    }
    setOpen(false)
  }

  const cancelClose = () => {
    clearTimeout(closeTimerRef.current)
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimerRef.current = setTimeout(() => handleClose(), 100)
  }

  return (
    <span
      className="info-popover"
      onMouseEnter={hoverOnly ? () => {
        cancelClose()
        openPopover(false)
      } : undefined}
      onMouseLeave={hoverOnly ? scheduleClose : undefined}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`info-popover-btn${hoverOnly ? ' info-popover-btn-hover-only' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={triggerAriaLabel}
        onClick={hoverOnly ? undefined : handleOpen}
        onKeyDown={(e) => {
          if(e.key === 'Enter' || e.key === ' ') {
            if (hoverOnly) {
              e.preventDefault()
              openPopover(false)
            } else {
              handleOpen(e)
            }
          }
        }}
      >
        <InfoIcon
          className={iconClassName}
        />
      </button>

      <dialog
        ref={dialogRef}
        className="info-popover-dialog"
        aria-labelledby={titleId}
        tabIndex="-1"
        onMouseEnter={hoverOnly ? cancelClose : undefined}
        onMouseLeave={hoverOnly ? scheduleClose : undefined}
        onClose={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
        onKeyDown={(e) => {
          if(e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation()
            e.preventDefault()
          }
        }}
      >
        <div className="info-popover-title">
          <h2 id={titleId}>{title}</h2>
          <CloseIcon
            className="icon-sm close-icon me-0"
            onClick={handleClose}
            onKeyDown={(e) => {
              if(e.key === 'Enter' || e.key === ' ') {
                handleClose(e)
              }
            }}
            tabIndex="0"
            aria-label={t("fix.button.close")}
            alt={t("fix.button.close")}
            title={t("fix.button.close")}
            role="button"
          />
        </div>
        <div className="info-popover-content" dangerouslySetInnerHTML={{__html: content}} />
        {action && <div className="info-popover-action">{action}</div>}
      </dialog>
    </span>
  )
}
