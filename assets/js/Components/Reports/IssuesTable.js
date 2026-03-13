import React, { useState, useEffect, useRef } from 'react'
import SortableTable from '../Widgets/SortableTable'
import './IssuesTable.css'

export default function IssuesTable({
  t,
  issues,
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
  const [rows, setRows] = useState([])

  const sortContent = () => {
    let tempRows = (issues) ? Object.values(issues) : []
    const { sortBy, ascending } = tableSettings

    tempRows.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (typeof(aValue) === "object" && typeof(bValue) === "object") {
        aValue = a[sortBy + "_display"] || ""
        bValue = b[sortBy + "_display"] || ""
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
  }, [tableSettings, issues])

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
