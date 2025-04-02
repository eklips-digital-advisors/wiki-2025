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
  nrOfSitesData: {
    data: StatEntry[]
  }
}

export const TotalNumberOfSites = ({ nrOfSitesData }: StatsChartProps) => {
  const data: any = nrOfSitesData

  if (!data) return

  return (
    <Line
      data={{
        labels: data.map((entry: any) =>
          entry.year
        ),
        datasets: [
          {
            label: `Number of sites`,
            data: data.map((entry: any) => entry.count),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            yAxisID: 'y',
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
              text: `Number of sites`,
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

export default TotalNumberOfSites
