import React, { useState, useEffect, useRef } from 'react'
import SortableTable from '../Widgets/SortableTable'
import { formNameFromRule } from '../../Services/Ufixit'
import InfoPopover from '../Widgets/InfoPopover'
import './IssuesTable.css'

export default function IssuesTable({
  t,
  issues,
  quickSearchTerm = null,
  isAdmin,
  selectedCourse
}) {

  const headers = [
    { id: "label", text: t('report.header.issue_type') },
    { id: "type", text: t('report.header.severity')},
    { id: "active", text: t('report.header.active'), alignText: 'center' },
    { id: "handled", text: t('report.header.handled'), alignText: 'center' }
  ]

  if (isAdmin && (selectedCourse == null)) {
    headers.push({ id: "courses", text: t('report.header.courses'), alignText: 'center' })
  }

  headers.push({ id: "total", text: t('report.header.total'), alignText: 'center' })

  const [tableSettings, setTableSettings] = useState({
    sortBy: 'total',
    ascending: false,
    pageNum: 0,
  })
  const [localIssues, setLocalIssues] = useState([])
  const [rows, setRows] = useState([])

  const sortContent = () => {
    let tempRows = (issues) ? Object.values(localIssues) : []
    const { sortBy, ascending } = tableSettings

    tempRows.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

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
            <InfoPopover
              t={t}
              content={t(`form.${formName}.summary`)}
            />
          </span>
        )
        issue.summary = t(`form.${formName}.summary`)
        if(quickSearchTerm !== null) {
          issue.onClick = () => quickSearchTerm(searchTerm)
        }
        return issue
      }))

      let mergedIssues = []
      let labels = []
      tempIssues.forEach((issue) => {
        if (!labels.includes(issue.label)) {
          labels.push(issue.label)
          if(issue.type === 'error' || issue.type === 'issue') {
            issue.type = t('filter.label.severity.issue')
          }
          else if(issue.type === 'potential') {
            issue.type = t('filter.label.severity.potential')
          }
          else if(issue.type === 'suggestion') {
            issue.type = t('filter.label.severity.suggestion')
          }
          issue.handled = (issue.fixed + issue.resolved > 0 ? 1 : 0)
          mergedIssues.push(issue)
        }
        else {
          let index = mergedIssues.findIndex((i) => i.label === issue.label)
          mergedIssues[index].total += issue.total
          mergedIssues[index].active += issue.active
          mergedIssues[index].handled += (issue.fixed + issue.resolved > 0 ? 1 : 0)
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
    </>
  )
}
