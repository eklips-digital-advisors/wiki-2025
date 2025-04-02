import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

type StatEntry = {
  date: string
  requests: number
  bandwidth: number
}

type StatsChartProps = {
  siteChartData: {
    data: StatEntry[]
  }
}

export const TotalBandwidthAndRequests = ({ siteChartData }: StatsChartProps) => {
  const data: any = siteChartData
  console.log('data', data)

  if (!data) return

  return (
    <Line
      data={{
        labels: data.map((entry: any) =>
          entry.date
        ),
        datasets: [
          {
            label: `Requests`,
            data: data.map((entry: any) => entry.requests),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            yAxisID: 'y',
          },
          {
            label: `Bandwidth GB`,
            data: data.map((entry: any) => entry.bandwidth / 1024 / 1024 / 1024), // Convert to GB
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            yAxisID: 'y1',
          },
        ],
      }}
      options={{
        responsive: true,
        // maintainAspectRatio: false,
        scales: {
          y: {
            // beginAtZero: true,
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: `Requests`,
            },
          },
          y1: {
            // beginAtZero: true,
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: `Bandwidth (GB)`,
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: true,
            position: 'bottom',
            // labels: {
            //   boxWidth: 10,
            //   boxHeight: 10,
            //   padding: 10,
            // },
          },
        },
      }}
    />
  )
}

export default TotalBandwidthAndRequests
