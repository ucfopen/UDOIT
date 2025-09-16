import React, { useState, useEffect, useRef } from 'react'
import SortableTable from '../SortableTable'
import { formNameFromRule } from '../../Services/Ufixit'
import InfoIcon from '../Icons/InfoIcon'

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
  const popoverRef = useRef(null);
  const lastButtonRef = useRef(null);
  const [ariaLive, setAriaLive] = useState('');

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
    if (!popover.open) return;
    // Focus the popup content when it opens
    if (popoverContentRef.current) {
      popoverContentRef.current.focus();
    }
    setAriaLive(popover.content);

    const close = () => setPopover(p => ({ ...p, open: false }));
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
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
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {label}
            <button
              type="button"
              title={t('report.button.issue_tooltip')}
              aria-haspopup="dialog"
              aria-expanded={popover.open}
              aria-controls={popover.open ? "issue-info-popover" : undefined}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
                marginLeft: 4,
                display: "flex",
                alignItems: "center",
                lineHeight: 1,
              }}
              ref={el => {
                // Store the ref to the last button clicked
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
              <InfoIcon width={18} height={18} className="icon-info" />
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
      {/* ARIA live region for screen readers */}
      <div aria-live="polite" style={{position: 'absolute', left: '-9999px', height: 0, width: 0, overflow: 'hidden'}}>
        {ariaLive}
      </div>
      {popover.open && (
        <div
          id="issue-info-popover"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          ref={popoverRef}
          style={{
            position: "absolute",
            left: popover.x,
            top: popover.y,
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            padding: "12px 16px",
            minWidth: 220,
            maxWidth: 320,
            fontSize: "0.95em",
            outline: "none",
          }}
          onClick={e => e.stopPropagation()}
        >
          <div
            style={{ marginBottom: 8 }}
            tabIndex={-1}
            ref={popoverContentRef}
          >
            {popover.content}
          </div>
          <button
            type="button"
            style={{
              border: "none",
              background: "none",
              color: "var(--link-color)",
              cursor: "pointer",
              fontSize: "1em",
              float: "right",
            }}
            onClick={() => setPopover({ ...popover, open: false })}
          >
            {t('fix.button.close_learn_more')}
          </button>
        </div>
      )}
    </>
  )
}
