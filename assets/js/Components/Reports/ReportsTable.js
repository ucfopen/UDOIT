import React, { useState, useEffect } from 'react'
import SortableTable from '../SortableTable'

export default function ReportsTable({
  t,
  reports,
  isAdmin
}) {

  const headers = [
    { id: "created", text: t('label.date') },
    { id: "errors", text: t('label.plural.error') },
    { id: "suggestions", text: t('label.plural.suggestion') },
    { id: "contentFixed", text: t('label.content_fixed') },
    { id: "contentResolved", text: t('label.content_resolved') },
    { id: "filesReviewed", text: t('label.files_reviewed')}
  ]

  if (isAdmin) {
    headers.push({ id: "count", text: t('label.admin.courses') })
  }

  const [tableSettings, setTableSettings] = useState({
    sortBy: 'created',
    ascending: false,
    pageNum: 0,
  })
  const [rows, setRows] = useState([])

  const getContent = () => {
    let list = reports
    const { sortBy, ascending } = tableSettings 

    list.sort((a, b) => {
      if (isNaN(a[sortBy]) || isNaN(b[sortBy])) {
        return (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) ? -1 : 1
      }
      else {
        return (Number(a[sortBy]) < Number(b[sortBy])) ? -1 : 1
      }
    })

    if (!ascending) {
      list.reverse()
    }

    return list
  }

  const handleTableSettings = (setting) => {
    setTableSettings(Object.assign({}, tableSettings, setting))
  }

  useEffect(() => {
    setRows(getContent())
  }, [tableSettings, reports])

  return (
    <SortableTable
      caption={t('label.report_history')}
      headers={headers}
      rows={getContent()}
      tableSettings={tableSettings}
      handleTableSettings={handleTableSettings}
      t={t}
    />
  )
}