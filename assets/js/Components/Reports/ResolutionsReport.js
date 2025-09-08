import React, { useState, useEffect } from 'react'
import Chart from 'chart.js/auto'

export default function ResolutionsReport ({
  t,
  reports,
  visibility = {
    issues: true,
    potentialIssues: true,
    suggestions: true
  }
}) {

  const [liveChart, setLiveChart] = useState(null)

  const getChartData = () => {
    let tempReports = reports.sort((a, b) => {
      return new Date(a.created) - new Date(b.created)
    })

    let data = {
      labels: [],
      datasets: [
        {
          id: 1,
          label: t('report.header.issues'),
          data: [],
          fill: false,
          backgroundColor: 'rgba(249, 65, 68, 0.5)',
          borderColor: '#F94144',
          tension: 0,
          hidden: !visibility.issues
        },
        {
          id: 2,
          label: t('report.header.potential'),
          data: [],
          fill: false,
          borderDash: [7, 3],
          backgroundColor: 'rgba(247, 150, 30, 0.5)',
          borderColor: '#F8961E',
          tension: 0,
          hidden: !visibility.potentialIssues
        },
        {
          id: 3,
          label: t('report.header.files_unreviewed'),
          data: [],
          fill: false,
          borderDash: [3, 5],
          backgroundColor: 'rgba(48, 176, 228, 0.5)',
          borderColor: '#32B0E4',
          tension: 0,
          hidden: !visibility.suggestions
        }
      ]
    }

    for (let report of tempReports) {
      data.labels.push(report.created)

      if(report?.scanCounts) {
        data.datasets[0].data.push(report.scanCounts.errors)
        data.datasets[1].data.push(report.scanCounts.potentials)
        data.datasets[2].data.push(report.scanCounts.files || 0)
      }
      else {
        data.datasets[0].data.push(report.errors)
        data.datasets[1].data.push(0)
        data.datasets[2].data.push(0)
      }
    }

    return data
  }

  const getChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 15,
              weight: 'normal',
              lineHeight: 1.5,
              family: "'Open Sans', Arial, Helvetica, sans-serif"
            }
          }
        },
      },
    }
  }

  useEffect(() => {
    const data = getChartData()
    const options = getChartOptions()

    // setChartData(data)
    // setChartOptions(options)

    if (liveChart) {
      liveChart.data = data
      liveChart.options = options
      liveChart.update()
      return
    }

    let element = document.getElementById('resolutionsChart')
    if (element) {
      let newChart = new Chart(element, {
        type: 'line',
        data: data,
        options: options
      })
      setLiveChart(newChart)
    }
  }, [reports, visibility])

  return (
    <canvas id="resolutionsChart" className="ResolutionsReportChart" />
  )
}
