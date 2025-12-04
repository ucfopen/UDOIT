import React, { useState, useEffect } from 'react'

import Api from '../Services/Api'
import ResolutionsReport from './Reports/ResolutionsReport'
import ReportsTable from './Reports/ReportsTable'
import IssuesTable from './Reports/IssuesTable'
import ProgressIcon from './Icons/ProgressIcon'
import PrintIcon from './Icons/PrintIcon'
import './ReportsPage.css'

export default function ReportsPage({t, report, settings, quickSearchTerm}) {

  const [reports, setReports] = useState([])
  const [fetchedReports, setFetchedReports] = useState(false)
  const [issues, setIssues] = useState([])
  const [showChart, setShowChart] = useState(true)
  const [showTable, setShowTable] = useState(false)

  const getReportHistory = () => {
    const api = new Api(settings)
    api.getReportHistory()
      .then((responseStr) => responseStr.json())
      .then((response) => {
        setReports(response.data)
        setFetchedReports(true)
      })
  }

  const processIssues = (report) => {

    let rules = []

    for (let issue of report.issues) {
      const rule = issue.scanRuleId
      const status = issue.status

      if (!rules[rule]) {
        rules[rule] = {
          id: rule,
          type: issue.type,
          active: 0,
          fixed: 0,
          resolved: 0,
          total: 0
        }
      }

      if (2 === status) {
        rules[rule]['resolved']++
      }
      else if (1 === status) {
        rules[rule]['fixed']++
      }
      else {
        rules[rule]['active']++
      }
      rules[rule]['total']++
    }

    return rules
  }

  useEffect(() => {
    if (reports.length === 0) {
      getReportHistory()
    }
  }, [])

  useEffect(() => {
    setIssues(processIssues(report))
  }, [report])

  // const toggleChartVisibility = (chart) => {
  //   const tempVisibility = Object.assign({}, chartVisibility, {[chart]: !chartVisibility[chart]})
  //   setChartVisibility(tempVisibility)
  // }

  const getPrintableReportsTable = (reports, t) => {
    const headers = [
      { id: "created", text: t('report.header.date') },
      { id: "errors", text: t('report.header.issues'), alignText: 'center' },
      { id: "potentialIssues", text: t('report.header.potential'), alignText: 'center' },
      { id: "suggestions", text: t('report.header.suggestions'), alignText: 'center' },
      { id: "contentFixed", text: t('report.header.items_fixed'), alignText: 'center' },
      { id: "contentResolved", text: t('report.header.items_resolved'), alignText: 'center' },
      { id: "filesReviewed", text: t('report.header.files_reviewed'), alignText: 'center'}
    ]

    const sortedReports = [...reports].sort((a, b) => {
      return new Date(b.created) - new Date(a.created)
    })

    const tableHeaders = headers.map(h => `<th>${h.text}</th>`).join('')
    const tableRows = sortedReports.map(row => {
      const cells = headers.map(h => `<td>${row[h.id] != null ? row[h.id] : ''}</td>`).join('')
      return `<tr>${cells}</tr>`
    }).join('')

    return `
      <h3>${t('report.title.scan_history')}</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `
  }

  const getPrintableIssuesTable = (issues, t) => {
    const headers = [
      { id: "label", text: t('report.header.issue_type') },
      { id: "type", text: t('report.header.severity')},
      { id: "active", text: t('report.header.active'), alignText: 'center' },
      { id: "fixed", text: t('report.header.fixed'), alignText: 'center' },
      { id: "resolved", text: t('report.header.resolved'), alignText: 'center' },
      { id: "total", text: t('report.header.total'), alignText: 'center' }
    ]

    let rows = issues ? Object.values(issues) : []

    rows.sort((a, b) => Number(b.total) - Number(a.total))

    const tableHeaders = headers.map(h => `<th>${h.text}</th>`).join('')
    const tableRows = rows.map(row => {
      const cells = headers.map(h => `<td>${row[h.id] != null ? row[h.id] : ''}</td>`).join('')
      return `<tr>${cells}</tr>`
    }).join('')

    return `
      <h3>${t('report.title.issues_by_type')}</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `
  }

  const printReport = () => {
    const printWindow = window.open()
    const reportsTableRaw = getPrintableReportsTable(reports, t)
    const issuesTableRaw = getPrintableIssuesTable(issues, t)
    const canvas = document.getElementById('resolutionsChart')
    const dataUrl = canvas ? canvas.toDataURL('image/png') : ''
    const content = `
      <html>
        <head>
          <title>${t('report.label.printed_report')}</title>
          <style>
            body {
              background: #fff;
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h2, h3 {
              color: #000;
            }
            h2 {
              text-align: center;
            }
            table {
              width: 100%; border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid #000;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            #printResolutionsReport {
              display: flex;
              flex-direction: row;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          <h2>${t('report.label.printed_report')}</h2>
          <div id="printResolutionsReport">
            <img src="${dataUrl}" alt="${t('report.label.resolutions_chart')}" style="max-width: 100%; height: auto; margin-bottom: 20px;" />
          </div>
          <div id="reportsTable">
            ${reportsTableRaw}
          </div>
          <div id="issuesTable">
            ${issuesTableRaw}
          </div>
          <script>
            window.onload = function () {
              window.print();
            };
            window.onafterprint = function () {
              window.close();
            };
          </script>
        </body>
      </html>
    `
    printWindow.document.write(content)
    const oldCanvas = document.querySelector('.chartjs-render-monitor')
    const newCanvas = printWindow.document.querySelector('.chartjs-render-monitor')
    if (oldCanvas && newCanvas) {
      const newContext = newCanvas.getContext('2d')
      newContext.drawImage(oldCanvas, 0, 0)
    }
    printWindow.document.close()
  }

  return (
    <div className="report-page-container scrollable">
      <div className="flex-row justify-content-between gap-4">
        <h1 className="primary-dark">{t('menu.reports')}</h1>
        { (fetchedReports && reports.length > 0) && (
          <div className="flex-column justify-content-center">
            <button className="btn-small btn-primary btn-icon-left" onClick={()=> printReport()}>
              <PrintIcon className="icon-md" />
              {t('report.button.print')}
            </button>
          </div>
        )}
      </div>
      { (!fetchedReports) && (
        <div className="mt-3 mb-3 flex-row justify-content-center">
          <div className="flex-column justify-content-center me-3">
            <ProgressIcon className="icon-lg udoit-suggestion spinner" />
          </div>
          <div className="flex-column justify-content-center">
            <h2 className="mt-0 mb-0">{t('report.label.loading_reports')}</h2>
          </div>
        </div>
      )}
      { (fetchedReports && reports.length === 0) && (
        <div className="flex-row justify-content-center mt-3">
          <h2 className="mt-0 mb-0">{t('report.label.no_results')}</h2>
        </div>
      )}

      { (fetchedReports && reports.length > 0) && (
        <div className="flex-column">
          <div className="flex-row justify-content-start gap-2 flex-wrap options-container">
            <div className="options-label">{t('report.label.progress_over_time')}</div>
            <div className="flex-row gap-1">
              <input type="checkbox" id="showChart" name="showChart"
                checked={showChart}
                onChange={() => setShowChart(!showChart)} />
              <label className="fw-bolder" htmlFor="showChart">{t('report.option.show_chart')}</label>
            </div>
            <div className="flex-row gap-1">
              <input type="checkbox" id="showTable" name="showTable"
                checked={showTable}
                onChange={() => setShowTable(!showTable)} />
              <label className="fw-bolder" htmlFor="showTable">{t('report.option.show_table')}</label>
            </div>
          </div>
          <div className="flex-column w-100 flex-shrink-1 flex-grow-1">
            { showChart && (
              <div className="mt-4">
                <div id="resolutionsReport" className="graph-container">
                  <ResolutionsReport t={t} reports={reports}/>
                </div>
              </div>
            )}

            { showTable && (
              <div className="mt-4">
                <ReportsTable
                  t={t}
                  reports={reports}/>
              </div>
            )}
            
          </div>

          <div className="mt-4">
            <IssuesTable
              t={t}
              settings={settings}
              quickSearchTerm={quickSearchTerm}
              issues={issues}/>
          </div>
        </div>
      )}
    </div>
  )
}
