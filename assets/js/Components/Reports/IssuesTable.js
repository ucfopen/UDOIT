import React, { useState, useEffect } from 'react'
import SortableTable from '../SortableTable'
import { formNameFromRule } from '../../Services/Ufixit'

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

  // The "total" is always the last column of the table
  headers.push({ id: "total", text: t('report.header.total'), alignText: 'center' })

  const [tableSettings, setTableSettings] = useState({
    sortBy: 'total',
    ascending: false,
    pageNum: 0,
  })
  const [localIssues, setLocalIssues] = useState([])
  const [rows, setRows] = useState([])
  const [popover, setPopover] = useState({ open: false, content: '', x: 0, y: 0 });

  const sortContent = () => {

    let tempRows = (issues) ? Object.values(localIssues) : []
    const { sortBy, ascending } = tableSettings

    tempRows.sort((a, b) => {
      if (isNaN(a[sortBy]) || isNaN(b[sortBy])) {
        return (a[sortBy].toLowerCase() > b[sortBy].toLowerCase()) ? -1 : 1
      }
      else {
        return (Number(a[sortBy]) < Number(b[sortBy])) ? -1 : 1
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
        issue.label = (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {label}
            <button
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#097c1eff",
                fontSize: "1.1em",
                padding: 0,
                marginLeft: 4,
              }}
              title={t('report.button.quick_view')}
              onClick={e => {
                e.stopPropagation();
                const rect = e.target.getBoundingClientRect();
                setPopover({
                  open: true,
                  content: issue.summary,
                  x: rect.right + window.scrollX + 8,
                  y: rect.top + window.scrollY - 120,
                });
              }}
            >
              (?)
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

  useEffect(() => {
    if (!popover.open) return;
    const close = () => setPopover(p => ({ ...p, open: false }));
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [popover.open]);

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
      {popover.open && (
        <div
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
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ marginBottom: 8 }}>{popover.content}</div>
          <button
            style={{
              border: "none",
              background: "none",
              color: "#0074d9",
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
