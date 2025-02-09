import React from 'react'
import { TableProperties } from 'lucide-react'
import { SiteItem } from '@/blocks/SitesBlock/sites-types'
import { formatBytes } from '@/utilities/formatBytes'

type SiteChartData = SiteItem['singleClodflareAnalyticsMultipleDays']

export const PathTable = ({ siteChartData }: { siteChartData: SiteChartData }) => {
  return (
    <span className="group relative">
      <TableProperties className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />

      <span className="absolute right-[20px] top-1/2 mt-2 w-100 h-42 overflow-hidden transform -translate-y-1/2 bg-white border border-gray-300 shadow-lg rounded-lg p-2 z-50 opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-opacity transition-transform duration-300">
        {siteChartData?.pathData && siteChartData?.pathData.map((item, index) => (
          <div className="flex gap-2 break-all border-b border-zinc-100" key={index}>
            <div>{formatBytes(Number(item?.sum?.edgeResponseBytes) || 0)}</div>
            <div title={item?.dimensions?.clientRequestPath}>{item?.dimensions?.clientRequestPath}</div>
          </div>
        ))}
      </span>
    </span>
  )
}

export default PathTable
