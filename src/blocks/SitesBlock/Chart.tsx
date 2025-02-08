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
import { LineChart } from 'lucide-react'
import { SiteItem } from '@/blocks/SitesBlock/sites-types'

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

type SiteChartData = SiteItem['singleClodflareAnalyticsMultipleDays']

export const Chart = ({ siteChartData }: { siteChartData: SiteChartData }) => {
  console.log('siteChartData', siteChartData)
  
  return (
    <span className="group relative">
      <LineChart className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />

      <span className="absolute right-[20px] top-1/2 mt-2 w-80 h-52 transform -translate-y-1/2 bg-white border border-gray-300 shadow-lg rounded-lg p-2 z-50 opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-opacity transition-transform duration-300">
        <Line
          data={{
            labels: siteChartData?.groupedData.map((entry) => entry.dateTime),
            datasets: [
              {
                label: `Total requests: ${siteChartData?.totalRequests}`,
                data: siteChartData?.groupedData.map((entry) => entry.requests),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                yAxisID: 'y',
              },
              {
                label: `Total bandwidth: ${siteChartData?.totalBandwidth.toFixed(2)} (GB)`,
                data: siteChartData?.groupedData.map((entry) => entry.bandwidth),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                yAxisID: 'y1',
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: { display: false },
              },
              y: {
                beginAtZero: true,
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: `Requests`,
                },
              },
              y1: {
                beginAtZero: true,
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: `Bandwidth`,
                },
                grid: {
                  drawOnChartArea: false, // Prevents grid lines from overlapping
                },
              },
            },
            plugins: {
              title: {
                display: true,
                text: `Last 24 hours`,
              },
              legend: {
                display: true,
                position: 'bottom',
                labels: {
                  boxWidth: 10, // Set the legend box width (default is 40)
                  boxHeight: 10, // Optional: set the height
                  padding: 10, // Space between text and box
                },
              },
            },
          }}
        />
      </span>
    </span>
  )
}

export default Chart
