import React, { useState, useEffect } from 'react'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { Text } from '@instructure/ui-text'
import { Heading } from '@instructure/ui-heading'

import Api from '../Services/Api'
import { Spinner } from '@instructure/ui-spinner'

import ResolutionsReport from './Reports/ResolutionsReport'
import ReportsTable from './Reports/ReportsTable'
import IssuesTable from './Reports/IssuesTable'

import './ReportsPage.css'

export default function ReportsPage({t, report, settings}) {

  const [reports, setReports] = useState([])
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
    setChartVisibility(prevState => ({
      ...prevState,
      [chart]: !prevState[chart]
    }))
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
          <div id="resolutionsReport">
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
              window.onafterprint = function () {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `
    printWindow.document.write(content)
    printWindow.document.close()
  }

  if (reports.length === 0) {
    return (
      <View as="div" padding="small 0">
        <View as="div" textAlign="center" padding="medium">
          <Spinner variant="inverse" renderTitle={t('label.loading_reports')} />
          <Text as="p" weight="light" size="large">{t('label.loading_reports')}</Text>
        </View>
      </View>
    )
  } else {
    return (
      <View as="div" padding="small 0">
        <Heading>{t('label.reports')}</Heading>
        <View as="div" margin="0 0 large 0">
          <Flex justifyItems="space-between" alignItems="start">
            <Flex.Item width="28%" padding="0">
              <h3>Options</h3>
              <p>
                <input 
                  type="checkbox" 
                  id="issuesToggle" 
                  checked={chartVisibility.issues} 
                  onChange={() => toggleChartVisibility('issues')}
                />
                <label htmlFor="issuesToggle"> Show issues</label>
              </p>
              <p>
                <input 
                  type="checkbox" 
                  id="potentialIssuesToggle" 
                  checked={chartVisibility.potentialIssues} 
                  onChange={() => toggleChartVisibility('potentialIssues')}
                />
                <label htmlFor="potentialIssuesToggle"> Show potential issues</label>
              </p>
              <p>
                <input 
                  type="checkbox" 
                  id="suggestionsToggle" 
                  checked={chartVisibility.suggestions} 
                  onChange={() => toggleChartVisibility('suggestions')}
                />
                <label htmlFor="suggestionsToggle"> Show suggestions</label>
              </p>
            </Flex.Item>
            <Flex.Item width="70%" padding="0">
              <View as="div" className="ResolutionsReport">
                <ResolutionsReport t={t} reports={reports} visibility={chartVisibility} />
              </View>
            </Flex.Item>
          </Flex>
        </View>
        <View as="div" margin="large 0">
          <IssuesTable
            issues={issues}
            settings={settings}
            t={t}
          />
        </View>
        <View as="div" margin="large 0">
          <ReportsTable
            reports={reports}
            t={t}
          />
        </View>
        {/* <View as="div" className="printArea">
          <ResolutionsReport t={t} reports={reports} visibility={chartVisibility} />
          <IssuesTable issues={issues} settings={settings} t={t} />
          <ReportsTable reports={reports} t={t} />
        </View> */}
        <View as="div" margin="large auto 0 0" display="flex" justifyContent="right">
          <button onClick={printReport} margin="0" color="white" background="#2C8AC1">Print Report</button>
        </View>
      </View>
    )
  }
}