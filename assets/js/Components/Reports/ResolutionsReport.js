import React, { useState, useEffect } from 'react'
import { Line } from '@reactchartjs/react-chart.js'

export default function ResolutionsReport({
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
          label: t('label.content_fixed'),
          data: [],
          fill: false,
          backgroundColor: '#00AC18',
          borderColor: '#00AC18',
        },
        {
          label: t('label.content_resolved'),
          data: [],
          fill: false,
          backgroundColor: '#008EE2',
          borderColor: '#008EE2',
        },
        {
          label: t('label.files_reviewed'),
          data: [],
          fill: false,
          backgroundColor: '#8B969E',
          borderColor: '#8B969E',
        }
      ]
    }

    for (let report of reports) {
      data.labels.push(report.created)

      data.datasets[0].data.push(report.contentFixed)
      data.datasets[1].data.push(report.contentResolved)
      data.datasets[2].data.push(report.filesReviewed)
    }

    return data
  }

  const getChartOptions = () => {
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

  useEffect(() => {
    setData(getChartData())
    setOptions(getChartOptions())
  }, [])

  return (
    <div className="mt-0 me-0 mb-0 ms-0" >
      <div className="flex-row justify-content-center mb-2">
        <h2 className="mt-0 mb-0">{t('label.plural.resolution')}</h2>
      </div>
      <Line data={data} options={options} />
    </div>
  )
}

// class ResolutionsReport extends React.Component {



//   render() {
//     const data = this.getChartData()
//     const options = this.getChartOptions()

//     return (
//       <div className="mt-0 me-0 mb-0 ms-0" >
//         <div className="flex-row justify-content-center mb-2">
//           <h2 className="mt-0 mb-0">{this.props.t('label.plural.resolution')}</h2>
//         </div>
//         <Line data={data} options={options} />
//       </div>
//     )
//   }

//   getChartData() {
//     let data = {
//       labels: [],
//       datasets: [
//         {
//           label: t('label.content_fixed'),
//           data: [],
//           fill: false,
//           backgroundColor: '#00AC18',
//           borderColor: '#00AC18',
//         },
//         {
//           label: t('label.content_resolved'),
//           data: [],
//           fill: false,
//           backgroundColor: '#008EE2',
//           borderColor: '#008EE2',
//         },
//         {
//           label: t('label.files_reviewed'),
//           data: [],
//           fill: false,
//           backgroundColor: '#8B969E',
//           borderColor: '#8B969E',
//         }
//       ]
//     }

//     for (let report of reports) {
//       data.labels.push(report.created)

//       data.datasets[0].data.push(report.contentFixed)
//       data.datasets[1].data.push(report.contentResolved)
//       data.datasets[2].data.push(report.filesReviewed)
//     }

//     return data
//   }

//   getChartOptions() {
//     return {
//       scales: {
//         yAxes: [
//           {
//             ticks: {
//               beginAtZero: true
//             },
//           },
//         ],
//       }
//     }
//   }
// }

// export default ResolutionsReport