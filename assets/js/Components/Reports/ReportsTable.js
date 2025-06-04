import React, { useState, useEffect } from 'react'
import SortableTable from '../SortableTable'

export default function ReportsTable({
  t,
  reports,
  isAdmin
}) {

  const headers = [
    { id: "created", text: t('report.header.date') },
    { id: "errors", text: t('report.header.issues'), alignText: 'center' },
    { id: "potentialIssues", text: t('report.header.potential'), alignText: 'center' },
    { id: "suggestions", text: t('report.header.suggestions'), alignText: 'center' },
    { id: "contentFixed", text: t('report.header.items_fixed'), alignText: 'center' },
    { id: "contentResolved", text: t('report.header.items_resolved'), alignText: 'center' },
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
        report.issues = report.scanCounts.issues
        report.potentialIssues = report.scanCounts.potentials
        report.suggestions = report.scanCounts.suggestions
      }
      else {
        report.potentialIssues = 0
      }
      return report
    })
    const { sortBy, ascending } = tableSettings

    list.sort((a, b) => {
      if (isNaN(a[sortBy]) || isNaN(b[sortBy])) {
        return (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) ? -1 : 1;
      }
      else {
        return (Number(a[sortBy]) < Number(b[sortBy])) ? -1 : 1;
      }
    })

    if (!ascending) {
      list.reverse();
    }

    return list;
  }

  const exportToCSV = () => {
    const tempHeaders = headers.map(header => header.text);

    const csvData = [];
    csvData.push(tempHeaders.join(','));

    rows.forEach(row => {
      const rowData = headers.map(header => {
        const value = row[header.id];
        return `"${value}"`;
      });
      csvData.push(rowData.join(','));
    });

    const csvString = csvData.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'UDOITHistoryReport.csv';
    link.click();
  }

  const handleTableSettings = (setting) => {
    setTableSettings(Object.assign({}, tableSettings, setting))
  }

  useEffect(() => {
    setRows(getContent())
  }, [tableSettings, reports])

  return (
    <>
      <SortableTable
        caption={t('report.title.scan_history')}
        headers={headers}
        rows={getContent()}
        tableSettings={tableSettings}
        handleTableSettings={handleTableSettings}
        t={t}
      />
      <button onClick={()=>exportToCSV()}>Print to CSV</button>
    </>
  )
}
