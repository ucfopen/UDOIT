import React, { useState, useEffect } from 'react'

import Api from '../Services/Api'
import ResolutionsReport from './Reports/ResolutionsReport'
import ReportsTable from './Reports/ReportsTable'
import IssuesTable from './Reports/IssuesTable'
import { formNameFromRule } from '../Services/Ufixit'
import InfoPopover from './Widgets/InfoPopover'
import StatusPill from './Widgets/StatusPill'
import ProgressIcon from './Icons/ProgressIcon'
import PrintIcon from './Icons/PrintIcon'
import RightArrowIcon from './Icons/RightArrowIcon'
import SortIcon from './Icons/SortIcon'
import './ReportsPage.css'

export default function ReportsPage({t, report, settings, quickSearchTerm}) {

  const [reports, setReports] = useState([])
  const [fetchedReports, setFetchedReports] = useState(false)
  const [issues, setIssues] = useState([])
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
          severity: (issue.type == 'error' ? t("filter.label.severity.issue") : t("filter.label.severity.potential")),
          active: 0,
          resolved: 0,
          total: 0
        }
      }

      rules[rule]['total']++
      if (0 === status) {
        rules[rule]['active']++
      }
      else {
        rules[rule]['resolved']++
      }
    }

    let tempIssues = Object.values(rules)
    tempIssues.map((issue => {
      let label = ''
      let searchTerm = ''
      let content = ''
      let formName = formNameFromRule(issue.id)
      if(formName === 'review_only') {
        label = t('report.label.unhandled') + issue.id
        let tempContent = t('rule.summary.'+ issue.id)
        if(tempContent === `rule.summary.${issue.id}`) {
          tempContent = t('form.review_only.summary')
        }
        content = tempContent
        searchTerm = issue.id
      }
      else {
        label = t(`form.${formName}.title`)
        searchTerm = t(`form.${formName}.title`)
        content = t(`form.${formName}.summary`)
      }
      issue.display = label
      issue.label = ( 
        <span className="issue-label clickable-text">
          {label}
          <InfoPopover
            t={t}
            title={t('fix.label.barrier_information')}
            content={content}
            action={(
              <button
                className="btn-text btn-link btn-icon-right"
                onClick={() => quickSearchTerm(searchTerm)}
              >
                {t('report.label.view_barriers')}
                <RightArrowIcon className='icon-sm' />
              </button>
            )}
          />
        </span>
      )
      issue.label_display = label
      issue.summary = t(`form.${formName}.summary`)
      if(quickSearchTerm !== null) {
        issue.onClick = () => quickSearchTerm(searchTerm)
      }
      return issue
    }))

    let mergedIssues = []
    let labels = []
    tempIssues.forEach((issue) => {
      if (!labels.includes(issue.label_display)) {
        labels.push(issue.label_display)
        if(issue.type === 'error' || issue.type === 'issue') {
          issue.type = (<StatusPill t={t} settings={settings} issue={{status: settings.ISSUE_FILTER.ACTIVE, severity: settings.ISSUE_FILTER.ISSUE}} />)
          issue.type_display = t('filter.label.severity.issue')
        }
        else if(issue.type === 'potential' || issue.type === 'suggestion') {
          issue.type = (<StatusPill t={t} settings={settings} issue={{status: settings.ISSUE_FILTER.ACTIVE, severity: settings.ISSUE_FILTER.POTENTIAL}} />)
          issue.type_display = t('filter.label.severity.potential')
        }
        issue.handled = (issue.fixed + issue.resolved > 0 ? 1 : 0)
        mergedIssues.push(issue)
      }
      else {
        let index = mergedIssues.findIndex((i) => i.label_display === issue.label_display)
        mergedIssues[index].total += issue.total
        mergedIssues[index].active += issue.active
        mergedIssues[index].handled += (issue.fixed + issue.resolved > 0 ? 1 : 0)
      }
    })

    return mergedIssues
  }

  useEffect(() => {
    if (reports.length === 0) {
      getReportHistory()
    }
  }, [])

  useEffect(() => {
    setIssues(processIssues(report))
  }, [report])

  const getPrintableReportsTable = (reports, t) => {
    const headers = [
      { id: "created", text: t('report.header.date') },
      { id: "knownBarriers", text: t('report.header.issues'), alignText: 'center' },
      { id: "potentialBarriers", text: t('report.header.potential'), alignText: 'center' },
      { id: "filesUnreviewed", text: t('report.header.suggestions'), alignText: 'center' },
      { id: "contentHandled", text: t('report.header.items_handled'), alignText: 'center' },
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
      { id: "severity", text: t('report.header.severity')},
      { id: "active", text: t('report.header.active'), alignText: 'center' },
      { id: "resolved", text: t('report.header.resolved'), alignText: 'center' },
      { id: "total", text: t('report.header.total'), alignText: 'center' }
    ]

    let rows = issues ? Object.values(issues) : []

    rows.sort((a, b) => Number(b.total) - Number(a.total))

    const tableHeaders = headers.map(h => `<th>${h.text}</th>`).join('')
    const tableRows = rows.map(row => {
      const cells = headers.map(h => `<td>${(typeof row[h.id] === 'object' && row[h.id + '_display']) ? row[h.id + '_display'] : row[h.id]}</td>`).join('')
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
            .subHeading {
              width: 100%;
              margin-top: -.5rem;
              text-align: center;
              font-size: 14px;
              color: #777;
              font-weight: 200;
            }
            table {
              width: 100%; border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid #000;
              font-size: 12px;
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
          <h2>${t('report.label.printed_report')}</h2>` +
          `<div class="subHeading">${t('report.label.generated_on', {date: new Date().toLocaleString()})}</p>` +
          `<div id="printResolutionsReport">
            <img src="${dataUrl}" alt="${t('report.label.resolutions_chart')}" style="max-width: 100%; height: auto; margin-bottom: 20px;" />
          </div>` +
          (showTable ?  `
          <div id="reportsTable">
            ${reportsTableRaw}
          </div>` : '') + 
          `<div id="issuesTable">
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
      <div className="pageTitleRow">
        <h1 className="pageTitle">{t('report.title')}</h1>
        { (fetchedReports && reports.length > 0) && (
          <button className="btn-small btn-icon-left btn-secondary" onClick={()=> printReport()}>
            <PrintIcon className="icon-md" />
            {t('report.button.print')}
          </button>
        )}
      </div>
      { (!fetchedReports) && (
        <div className="mt-3 mb-3 flex-row justify-content-center">
          <div className="flex-column justify-content-center me-3">
            <ProgressIcon className="icon-lg udoit-progress spinner" />
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
        <>
          <p className="pageSubtitle">{t('report.subtitle')}</p>
          <div className="flex-column">
            <div className="callout-container p-4 flex-column w-100 flex-shrink-1 flex-grow-1">
              <div id="resolutionsReport" className="graph-container">
                <ResolutionsReport t={t} reports={reports}/>
              </div>
              <div className="flex-row justify-content-end">
                <button 
                  className="btn-small btn-icon-right btn-secondary"
                  onClick={() => setShowTable(!showTable)}>
                    {showTable ? t('report.option.hide_data') : t('report.option.show_data')}
                    <SortIcon className={`icon-md ${showTable ? 'rotate-180' : ''}`} />
                </button>
              </div>

              { showTable && (
                <div className="data-table-container">
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
        </>
      )}
    </div>
  )
}
