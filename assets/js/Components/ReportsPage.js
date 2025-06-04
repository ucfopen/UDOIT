import React, { useState, useEffect } from 'react'

import Api from '../Services/Api'
import ResolutionsReport from './Reports/ResolutionsReport'
import ReportsTable from './Reports/ReportsTable'
import IssuesTable from './Reports/IssuesTable'
import ProgressIcon from './Icons/ProgressIcon'

export default function ReportsPage({t, report, settings, quickSearchTerm}) {

  const [reports, setReports] = useState([])
  const [fetchedReports, setFetchedReports] = useState(false)
  const [issues, setIssues] = useState([])
  const [chartVisibility, setChartVisibility] = useState({
    issues: true,
    potentialIssues: true,
    suggestions: true
  })

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

  const toggleChartVisibility = (chart) => {
    const tempVisibility = Object.assign({}, chartVisibility, {[chart]: !chartVisibility[chart]})
    setChartVisibility(tempVisibility)
  }

  const getPrintableReportsTable = (reports, t) => {
    const headers = [
      { id: "created", text: t('label.date') },
      { id: "errors", text: t('label.plural.error') },
      { id: "suggestions", text: t('label.plural.suggestion') },
      { id: "contentFixed", text: t('label.content_fixed') },
      { id: "contentResolved", text: t('label.content_resolved') },
      { id: "filesReviewed", text: t('label.files_reviewed') }
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
      <h3>${t('label.report_history')}</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `
  }

  const getPrintableIssuesTable = (issues, t) => {
    let headers = [
      { id: "label", text: t('label.issue') },
      { id: "type", text: t('label.issue_type') },
      { id: "active", text: t('label.active') },
      { id: "fixed", text: t('label.fixed') },
      { id: "resolved", text: t('label.resolved') },
    ]

    headers.push({ id: "total", text: t('label.report.total') })

    let rows = issues ? Object.values(issues) : []

    rows = rows.map((row) => ({
      ...row,
      label: t(`rule.label.${row.id}`)
    }))

    rows.sort((a, b) => Number(b.total) - Number(a.total))

    const tableHeaders = headers.map(h => `<th>${h.text}</th>`).join('')
    const tableRows = rows.map(row => {
      const cells = headers.map(h => `<td>${row[h.id] != null ? row[h.id] : ''}</td>`).join('')
      return `<tr>${cells}</tr>`
    }).join('')

    return `
      <h3>${t('label.admin.report.by_issue')}</h3>
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
    const content = `
      <html>
        <head>
          <title>UDOIT Print Report</title>
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
          </style>
        </head>
        <body>
          <h2>${t('label.reports')}</h2>
          <div id="printResolutionsReport">
            ${document.querySelector('.ResolutionsReport')?.innerHTML || ''}
          </div>
          <div id="issuesTable">
            ${issuesTableRaw}
          </div>
          <div id="reportsTable">
            ${reportsTableRaw}
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
    <main>
      <h1 className="primary-dark">{t('menu.reports')}</h1>
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
          <div className="flex-row justify-content-between gap-3">

            <div className="flex-column flex-shrink-0 flex-grow-1">
              <div className="flex-row justify-content-center">
                <h2 className="primary-dark mt-0 mb-3">{t('report.title.barriers_remaining')}</h2>
              </div>
              <ResolutionsReport t={t} reports={reports} visibility={chartVisibility} />
            </div>

            <div className="flex-column justify-content-start">
              <div className="callout-container">
                <h3 className="primary-dark mt-0">{t('report.title.options')}</h3>
                <div className="flex-row gap-1 mb-2">
                  <input
                    type="checkbox"
                    id="issuesToggle"
                    name="issuesToggle"
                    tabindex="0"
                    checked={chartVisibility.issues}
                    onChange={() => toggleChartVisibility('issues')}
                  />
                  <label htmlFor="issuesToggle">{t('report.option.show_issues')}</label>
                </div>
                <div className="flex-row gap-1 mb-2">
                  <input
                    type="checkbox"
                    id="potentialIssuesToggle"
                    name="potentialIssuesToggle"
                    tabindex="0"
                    checked={chartVisibility.potentialIssues}
                    onChange={() => toggleChartVisibility('potentialIssues')}
                  />
                  <label htmlFor="potentialIssuesToggle">{t('report.option.show_potential')}</label>
                </div>
                <div className="flex-row gap-1">
                  <input
                    type="checkbox"
                    id="suggestionsToggle"
                    name="suggestionsToggle"
                    tabindex="0"
                    checked={chartVisibility.suggestions}
                    onChange={() => toggleChartVisibility('suggestions')}
                  />
                  <label htmlFor="suggestionsToggle">{t('report.option.show_suggestions')}</label>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-4">
            <IssuesTable
              t={t}
              settings={settings}
              quickSearchTerm={quickSearchTerm}
              issues={issues}/>
          </div>

          <div className="mt-4">
            <ReportsTable
              t={t}
              reports={reports}/>
          </div>

          <div className="flex-row justify-content-end mt-3 mb-2 gap-2">
            <button className="btn btn-primary" onClick={()=> printReport()}>{t('report.button.print')}</button>
          </div>

        </div>
      )}
    </main>
  )
}
