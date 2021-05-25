import React from 'react'
import { View } from '@instructure/ui-view'
import { Heading } from '@instructure/ui-heading'
import { Bar } from '@reactchartjs/react-chart.js'

class IssuesReport extends React.Component {
  constructor(props) {
    super(props)
    this.myChart = React.createRef()
  }

  render() {
    const data = this.getChartData()
    const options = this.getChartOptions()

    return (
      <View as="div" margin="medium 0">
        <Heading level="h4" as="h3" margin="small 0">{this.props.t('label.plural.issue')}</Heading>
        <Bar data={data} options={options} />
      </View>
    )
  }

  getChartData() {
    let data = {
      labels: [],
      datasets: [
        {
          label: this.props.t('label.plural.error'),
          data: [],
          backgroundColor: '#D01A19',
        },
        {
          label: this.props.t('label.plural.suggestion'),
          data: [],
          backgroundColor: '#0770A3',
        }
      ]
    }

    let reports = this.props.reports //.reverse()

    for (let report of reports) {
      data.labels.push(report.created)

      data.datasets[0].data.push(report.errors)
      data.datasets[1].data.push(report.suggestions)

      data.datasets[0].data.push(report.errors)
      data.datasets[1].data.push(report.suggestions)
    }

    return data
  }

  getChartOptions() {
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
}

export default IssuesReport