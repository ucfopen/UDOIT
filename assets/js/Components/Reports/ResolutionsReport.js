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
          label: this.props.t('label.content_fixed'),
          data: [],
          fill: false,
          backgroundColor: '#00AC18',
          borderColor: '#00AC18',
        },
        {
          label: this.props.t('label.content_resolved'),
          data: [],
          fill: false,
          backgroundColor: '#008EE2',
          borderColor: '#008EE2',
        },
        {
          label: this.props.t('label.files_reviewed'),
          data: [],
          fill: false,
          backgroundColor: '#8B969E',
          borderColor: '#8B969E',
        }
      ]
    }

    for (let report of this.props.reports) {
      data.labels.push(report.created)

      data.datasets[0].data.push(report.contentFixed)
      data.datasets[1].data.push(report.contentResolved)
      data.datasets[2].data.push(report.filesReviewed)
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