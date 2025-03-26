import React from 'react'
import { View } from '@instructure/ui-view'
import { Heading } from '@instructure/ui-heading'
import { Line } from '@reactchartjs/react-chart.js'

class ResolutionsReport extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const data = this.getChartData()
    const options = this.getChartOptions()

    return (
      <View as="div" margin="medium 0">
        <Heading level="h4" as="h3" margin="small 0">{this.props.t('label.plural.resolution')}</Heading>
        <Line data={data} options={options} />
      </View>
    )
  }

  getChartData() {
    let data = {
      labels: [],
      datasets: [
        {
          label: this.props.t('label.filter.severity.issue'),
          data: [],
          fill: false,
          backgroundColor: '#BA0000',
          borderColor: '#BA0000',
        },
        {
          label: this.props.t('label.filter.severity.potential'),
          data: [],
          fill: false,
          backgroundColor: '#D9A600',
          borderColor: '#D9A600',
        },
        {
          label: this.props.t('label.filter.severity.suggestion'),
          data: [],
          fill: false,
          backgroundColor: '#2C8AC1',
          borderColor: '#2C8AC1',
        }
      ]
    }

    for (let report of this.props.reports) {
      data.labels.push(report.created)

      data.datasets[0].data.push(report.errors)
      data.datasets[1].data.push(report.contentResolved)
      data.datasets[2].data.push(report.suggestions)
    }

    return data
  }

  getChartOptions() {
    return {
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
}

export default ResolutionsReport