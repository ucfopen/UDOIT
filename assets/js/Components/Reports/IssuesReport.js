import React, { useState, useEffect } from 'react'
import { Bar } from '@reactchartjs/react-chart.js'

export default function IssuesReport ({
  t,
  reports
}) {

  const [data, setData] = useState(null)
  const [options, setOptions] = useState(null)

  const getChartData = () => {
    let data = {
      labels: [],
      datasets: [
        {
          label: t('label.plural.error'),
          data: [],
          backgroundColor: '#D01A19',
        },
        {
          label: t('label.plural.suggestion'),
          data: [],
          backgroundColor: '#0770A3',
        }
      ]
    }

    let tempReports = [...reports]
    tempReports.sort((a, b) => {
      const dateA = new Date(a.created)
      const dateB = new Date(b.created)

      return (dateA > dateB) ? 1 : -1
    })

    for (let report of tempReports) {
      data.labels.push(report.created)

      data.datasets[0].data.push(report.errors)
      data.datasets[1].data.push(report.suggestions)
    }

    return data
  }

  const getChartOptions = () => {
    return {
      scales: {
        yAxes: [
          {
            stacked: true,
            ticks: {
              beginAtZero: true
            },
          },
        ],
        xAxes: [
          {
            stacked: true,
          }
        ]
      }
    }
  }

  useEffect(() => {
    setData(getChartData())
    setOptions(getChartOptions())
  }
  , [reports])

  return (
    <div className="mt-0 me-0 mb-0 ms-0 w-100" >
      <div className="flex-row justify-content-center mb-2">
        <h2 className="mt-0 mb-0">{t('label.plural.issue')}</h2>
      </div>
      <Bar data={data} options={options} />
    </div>
  )
}