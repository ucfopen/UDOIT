import React, { useState, useEffect } from 'react'
import SortableTable from '../Widgets/SortableTable'

export default function ReportsTable({
  t,
  reports,
  isAdmin
}) {

  const headers = [
    { id: "created", text: t('report.header.date') },
    { id: "knownBarriers", text: t('report.header.issues'), alignText: 'center' },
    { id: "potentialBarriers", text: t('report.header.potential'), alignText: 'center' },
    { id: "filesUnreviewed", text: t('report.header.files_unreviewed'), alignText: 'center', divider: true },
    { id: "contentHandled", text: t('report.header.items_handled'), alignText: 'center' },
    { id: "filesReviewed", text: t('report.header.files_reviewed'), alignText: 'center'}
  ]

  if (isAdmin) {
    headers.push({ id: "count", text: t('report.header.courses') })
  }

  const [tableSettings, setTableSettings] = useState({
    sortBy: 'created',
    ascending: false,
    pageNum: 0,
  })
  const [rows, setRows] = useState([])

  const getContent = () => {
    let list = reports
    if (!list) {
      return []
    }

    list = list.map((report) => {
      if(report.scanCounts) {
        report.knownBarriers = report.scanCounts.errors || 0
        report.potentialBarriers = report.scanCounts.potentials
        report.filesUnreviewed = report.scanCounts.files || 0
      }
      else {
        report.knownBarriers = report.errors || 0
        report.potentialBarriers = 0
        report.filesUnreviewed = 0
      }
      report.contentHandled = report.contentFixed + report.contentResolved || 0
      return report
    })
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
      caption={t('report.title.barriers_remaining')}
      headers={headers}
      rows={getContent()}
      tableSettings={tableSettings}
      handleTableSettings={handleTableSettings}
      t={t}
    />
  )
}
