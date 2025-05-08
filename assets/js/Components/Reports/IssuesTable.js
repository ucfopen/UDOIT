import React, { useState, useEffect } from 'react'
import SortableTable from '../SortableTable'
import { formNameFromRule } from '../../Services/Ufixit'

export default function IssuesTable({
  t,
  issues,
  isAdmin
}) {

  const headers = [
    { id: "label", text: t('report.header.issue_type') },
    { id: "type", text: t('report.header.severity')},
    { id: "active", text: t('report.header.active') },
    { id: "fixed", text: t('report.header.fixed') },
    { id: "resolved", text: t('report.header.resolved') },
  ]

  if (isAdmin) {
    headers.push({ id: "courses", text: t('report.header.courses') })
  }

  // The "total" is always the last column of the table
  headers.push({ id: "total", text: t('report.header.total') })

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
      if (isNaN(a[sortBy]) || isNaN(b[sortBy])) {
        return (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) ? -1 : 1
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
        let formName = formNameFromRule(issue.id)
        if(formName === 'review_only') {
          label = t('report.label.unhandled') + issue.id
        }
        else {
          label = t(`form.${formName}.title`)
        }
        issue.label = label
        return issue
      }))

      // Merge the issues with the same labels
      let mergedIssues = []
      let labels = []
      tempIssues.forEach((issue) => {
        if (!labels.includes(issue.label)) {
          labels.push(issue.label)
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
    <SortableTable
      caption={t('report.title.issues_by_type')}
      headers={headers}
      rows={rows}
      tableSettings={tableSettings}
      handleTableSettings={handleTableSettings}
      t={t}
    />
  )
}