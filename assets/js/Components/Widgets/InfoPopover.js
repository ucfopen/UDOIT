import React, { useState, useRef, useEffect } from 'react'
import InfoIcon from '../Icons/InfoIcon'
import CloseIcon from '../Icons/CloseIcon'
import './InfoPopover.css'

export default function InfoPopover({
  t,
  triggerAriaLabel = t('report.button.issue_tooltip'),
  title = t('fix.button.learn_more'),
  content,
  action = null,
}) {

  const uuid = crypto.randomUUID()

  const [open, setOpen] = useState(false)

  const getCoords = (e) => {
    const margin = 16
    
    // Measure and adjust position so mouse is at bottom-left
    const rect = e.currentTarget.getBoundingClientRect()
    let newX = rect.x + rect.width + margin
    let newY = rect.y

    // Get viewport dimensions
    const vw = window.innerWidth
    const vh = window.innerHeight

    const dialog = document.getElementById(uuid + '-info-popover-dialog')
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

  const handleOpen = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const dialog = document.getElementById(uuid + '-info-popover-dialog')
    if (dialog) {
      dialog.showModal()
      const { x, y } = getCoords(e)
      dialog.style.left = `${x}px`
      dialog.style.top = `${y}px`
      const title = document.getElementById(uuid + '-info-popover-title')
      if (title) {
        title.focus()
      }
      setOpen(true)
    }
  }

  const handleClose = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const dialog = document.getElementById(uuid + '-info-popover-dialog')
    if (dialog && dialog.open) {
      dialog.close()
    }
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className="info-popover-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="info-popover-dialog"
        aria-label={triggerAriaLabel}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if(e.key === 'Enter' || e.key === ' ') {
            handleOpen(e)
          }
        }}
      >
        <InfoIcon
          className="icon-md"
        />
      </button>

      <dialog
        id={uuid + '-info-popover-dialog'}
        className="info-popover-dialog"
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
          <h2 id={uuid + '-info-popover-title'} tabIndex="-1">{title}</h2>
          <CloseIcon
            className="icon-sm"
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
    </>
  )
}