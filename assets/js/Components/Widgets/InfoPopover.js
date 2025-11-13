import React, { useState, useRef, useEffect } from 'react'
import FilledInfoIcon from '../Icons/FilledInfoIcon'
import './InfoPopover.css'

export default function InfoPopover({
  content,
  t,
  label = t('fix.button.close_learn_more'),
  iconSize = 18,
  triggerAriaLabel = t('report.button.issue_tooltip')
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const lastButtonRef = useRef(null)

  const handleOpen = (e) => {
    e.stopPropagation()
    let x, y
    // If opened by keyboard, e.clientX and e.clientY will be 0
    if (e.clientX === 0 && e.clientY === 0 && lastButtonRef.current) {
      const rect = lastButtonRef.current.getBoundingClientRect()
      x = rect.right + window.scrollX + 12
      y = rect.top + window.scrollY - 12 
    } else {
      x = e.clientX + window.scrollX + 12
      y = e.clientY + window.scrollY + 4
    }
    setCoords({ x, y })
    lastButtonRef.current = e.currentTarget
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    lastButtonRef.current?.blur()
}


  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleDialogClose = () => setOpen(false)
    dialog.addEventListener('close', handleDialogClose)
    return () => dialog.removeEventListener('close', handleDialogClose)
  }, [open])

  useEffect(() => {
    if (open && dialogRef.current) {
      if (!dialogRef.current.open) dialogRef.current.showModal()
      closeButtonRef.current?.focus()

      // Measure and adjust position so mouse is at bottom-left
      const rect = dialogRef.current.getBoundingClientRect()
      let newX = coords.x
      let newY = coords.y - rect.height

      // Get viewport dimensions
      const vw = window.innerWidth
      const vh = window.innerHeight
      const margin = 16

      // Adjust X if dialog overflows right edge
      if (newX + rect.width > vw) {
        newX = vw - rect.width - margin
      }
      // Adjust X if dialog overflows left edge
      if (newX < 0) {
        newX = margin
      }
      // Adjust Y if dialog overflows bottom edge
      if (newY + rect.height > vh) {
        newY = vh - rect.height - margin
      }
      // Adjust Y if dialog overflows top edge
      if (newY < 0) {
        newY = margin
      }

      setCoords({ x: newX, y: newY })

      const closeOnClickOutside = () => setOpen(false)
      window.addEventListener('click', closeOnClickOutside)
      return () => window.removeEventListener('click', closeOnClickOutside)
    } else if (dialogRef.current?.open) {
      dialogRef.current.close()
    }
  }, [open])

  // restore focus to last trigger
  useEffect(() => {
    if (!open && lastButtonRef.current) {
      lastButtonRef.current.focus()
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        className="info-popover-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? 'info-popover-dialog' : undefined}
        aria-label={triggerAriaLabel}
        onClick={handleOpen}
        ref={lastButtonRef}
      >

        <FilledInfoIcon
        width={iconSize}
        height={iconSize}
        className="icon-info"
        />
      </button>

      {open && (
        <dialog
          id="info-popover-dialog"
          ref={dialogRef}
          className="info-popover-dialog"
          style={{
            left: coords.x,
            top: coords.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="info-popover-content">{content}</div>
          <button
            type="button"
            className="info-popover-close"
            ref={closeButtonRef}
            onClick={handleClose}
          >
            {label}
          </button>
        </dialog>
      )}
    </>
  )
}
