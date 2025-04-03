import React, { useState, useEffect } from 'react'
import SortableTable from '../SortableTable'

export default function IssuesTable({
  t,
  issues,
  isAdmin
}) {

  const headers = [
    { id: "label", text: t('label.issue') },
    { id: "type", text: t('label.issue_type')},
    { id: "active", text: t('label.active') },
    { id: "fixed", text: t('label.fixed') },
    { id: "resolved", text: t('label.resolved') },
  ]

  if (isAdmin) {
    headers.push({ id: "courses", text: t('label.admin.courses') })
  }

  // The "total" is always the last column of the table
  headers.push({ id: "total", text: t('label.report.total') })

  const [tableSettings, setTableSettings] = useState({
    sortBy: 'total',
    ascending: false,
    pageNum: 0,
  })
  const [rows, setRows] = useState([])

  const getContent = () => {

    let tempRows = (issues) ? Object.values(issues) : []
    const { sortBy, ascending } = tableSettings 

    tempRows = tempRows.map((row) => {
      row.label = t(`rule.label.${row.id}`)
      return row
    })

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
    setRows(getContent())
  }, [tableSettings, issues])

  return (
    <SortableTable
      caption={t('label.admin.report.by_issue')}
      headers={headers}
      rows={rows}
      tableSettings={tableSettings}
      handleTableSettings={handleTableSettings}
      t={t}
    />
  )
}