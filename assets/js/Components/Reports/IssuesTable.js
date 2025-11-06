import React, { useState, useEffect, useRef } from 'react'
import SortableTable from '../Widgets/SortableTable'
import { formNameFromRule } from '../../Services/Ufixit'
import InfoIcon from '../Icons/FilledInfoIcon'
import './IssuesTable.css'

export default function IssuesTable({
  t,
  issues,
  quickSearchTerm = null,
  isAdmin
}) {

  const headers = [
    { id: "label", text: t('report.header.issue_type') },
    { id: "type", text: t('report.header.severity')},
    { id: "active", text: t('report.header.active'), alignText: 'center' },
    { id: "fixed", text: t('report.header.fixed'), alignText: 'center' },
    { id: "resolved", text: t('report.header.resolved'), alignText: 'center' },
  ]

  if (isAdmin) {
    headers.push({ id: "courses", text: t('report.header.courses') })
  }

  headers.push({ id: "total", text: t('report.header.total'), alignText: 'center' })

  const [tableSettings, setTableSettings] = useState({
    sortBy: 'total',
    ascending: false,
    pageNum: 0,
  })
  const [localIssues, setLocalIssues] = useState([])
  const [rows, setRows] = useState([])
  const [popover, setPopover] = useState({ open: false, content: '', x: 0, y: 0 });
  const popoverContentRef = useRef(null);
  const lastButtonRef = useRef(null);
  const [ariaLive, setAriaLive] = useState('');
  const closeButtonRef = useRef(null);

  const dialogRef = useRef(null);

  const sortContent = () => {
    let tempRows = (issues) ? Object.values(localIssues) : []
    const { sortBy, ascending } = tableSettings

    tempRows.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      // If sorting by label, use labelText for comparison
      if (sortBy === "label") {
        aValue = a.labelText || ""
        bValue = b.labelText || ""
      }

      if (isNaN(aValue) || isNaN(bValue)) {
        return (aValue.toLowerCase() > bValue.toLowerCase()) ? -1 : 1
      } else {
        return (Number(aValue) < Number(bValue)) ? -1 : 1
      }
    })

    if (!ascending) {
      tempRows.reverse()
    }

    return tempRows
  }

  const handleTableSettings = (setting) => {
    setTableSettings(Object.assign({}, tableSettings, setting))
  }

  useEffect(() => {
    setRows(sortContent())
  }, [tableSettings, localIssues])

  useEffect(() => {
    if (popover.open && dialogRef.current) {
      if (!dialogRef.current.open) {
        dialogRef.current.showModal();
      }
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
      setAriaLive(popover.content);

      const close = () => setPopover(p => ({ ...p, open: false }));
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    } else if (dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [popover.open, popover.content]);

  // When popover closes, return focus to the last info button
  useEffect(() => {
    if (!popover.open && lastButtonRef.current) {
      lastButtonRef.current.focus();
    }
  }, [popover.open]);

  useEffect(() => {
    if (issues) {
      let tempIssues = Object.values(issues)
      tempIssues.map((issue => {
        let label = ''
        let searchTerm = ''
        let formName = formNameFromRule(issue.id)
        if(formName === 'review_only') {
          label = t('report.label.unhandled') + issue.id
          searchTerm = issue.id
        }
        else {
          label = t(`form.${formName}.title`)
          searchTerm = t(`form.${formName}.title`)
        }
        issue.labelText = label
        issue.label = (
          <span className="issue-label">
            {label}
            <button
              type="button"
              title={t('report.button.issue_tooltip')}
              aria-haspopup="dialog"
              aria-expanded={popover.open}
              aria-controls={popover.open ? "issue-info-popover" : undefined}
              className="issue-info-btn"
              ref={el => {
                if (popover.open) return;
                lastButtonRef.current = el;
              }}
              onClick={e => {
                e.stopPropagation();
                const rect = e.target.getBoundingClientRect();
                setPopover({
                  open: true,
                  content: t(`form.${formName}.summary`),
                  x: rect.right + window.scrollX + 8,
                  y: rect.top + window.scrollY - 120,
                });
                lastButtonRef.current = e.target;
              }}
            >
              <InfoIcon width={18} height={18} className="icon-info" circleColor="var(--link-color)" iconColor="#fff" />
            </button>
          </span>
        )
        issue.summary = t(`form.${formName}.summary`)
        if(quickSearchTerm !== null) {
          issue.onClick = () => quickSearchTerm(searchTerm)
        }
        return issue
      }))

      // Merge the issues with the same labels
      let mergedIssues = []
      let labels = []
      tempIssues.forEach((issue) => {
        if (!labels.includes(issue.label)) {
          labels.push(issue.label)
          if(issue.type === 'error' || issue.type === 'issue') {
            issue.type = t('report.label.issue')
          }
          else if(issue.type === 'potential') {
            issue.type = t('report.label.potential')
          }
          else if(issue.type === 'suggestion') {
            issue.type = t('report.label.suggestion')
          }
          mergedIssues.push(issue)
        }
        else {
          let index = mergedIssues.findIndex((i) => i.label === issue.label)
          mergedIssues[index].total += issue.total
          mergedIssues[index].active += issue.active
          mergedIssues[index].fixed += issue.fixed
          mergedIssues[index].resolved += issue.resolved
        }
      })
      setLocalIssues(mergedIssues)
    }
    else {
      setLocalIssues([])
    }
  }, [issues])

  return (
    <>
      <SortableTable
        caption={t('report.title.issues_by_type')}
        headers={headers}
        rows={rows}
        tableSettings={tableSettings}
        handleTableSettings={handleTableSettings}
        t={t}
      />
      {/* ARIA for screen readers */}
      <div aria-live="polite" className="sr-only">
        {ariaLive}
      </div>
      {popover.open && (
        <dialog
          id="issue-info-popover"
          ref={dialogRef}
          className="issue-info-popover"
          style={{
            left: popover.x,
            top: popover.y,
          }}
          tabIndex={0}
          aria-labelledby="issue-info-popover-title"
          aria-describedby="issue-info-popover-content"
          onClick={e => e.stopPropagation()}
        >
          <div
            id="issue-info-popover-content"
            className="issue-info-popover-content"
            tabIndex={-1}
            ref={popoverContentRef}
          >
            {popover.content}
          </div>
          <button
            type="button"
            className="issue-info-popover-close"
            ref={closeButtonRef}
            onClick={() => setPopover({ ...popover, open: false })}
          >
            {t('fix.button.close_learn_more')}
          </button>
        </dialog>
      )}
    </>
  )
}
