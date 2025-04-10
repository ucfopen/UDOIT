import React, { useState, useEffect } from 'react'
import { Line } from '@reactchartjs/react-chart.js'

export default function ResolutionsReport ({
  t,
  reports,
  visibility
}) {

  const [chartData, setChartData] = useState(null)
  const [chartOptions, setChartOptions] = useState(null)

  const getChartData = () => {

    let data = {
      labels: [],
      datasets: [
        {
          label: t('label.filter.severity.issue'),
          data: [],
          fill: false,
          backgroundColor: 'rgba(249, 65, 68, 0.5)',
          borderColor: '#F94144',
          tension: 0,
          hidden: !visibility.issues
        },
        {
          label: t('label.filter.severity.potential'),
          data: [],
          fill: false,
          borderDash: [7, 3],
          backgroundColor: 'rgba(247, 150, 30, 0.5)',
          borderColor: '#F8961E',
          tension: 0,
          hidden: !visibility.potentialIssues
        },
        {
          label: t('label.filter.severity.suggestion'),
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

    for (let report of reports) {
      data.labels.push(report.created)

      data.datasets[0].data.push(report.errors)
      data.datasets[1].data.push(report.contentResolved)
      data.datasets[2].data.push(report.suggestions)
    }

    return data
  }

  const getChartOptions = () => {
    return {
      tension: 0,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            },
          },
        ],
      }
    }
  }

  useEffect(() => {
    const data = getChartData()
    const options = getChartOptions()

    setChartData(data)
    setChartOptions(options)
  }, [])

  useEffect(() => {
    const data = getChartData()

    setChartData(data)
  }, [reports, visibility])

  return (
    <Line data={chartData} options={chartOptions} />
  )
}