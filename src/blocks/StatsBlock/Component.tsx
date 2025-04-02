import React from 'react'
import { StatsBlockClient } from '@/blocks/StatsBlock/Component.client'
import { getCloudflareGlobalStats } from '@/utilities/GetCloudflareItems/getCloudflareGlobalStats'
import { getCumulativeZoneCountFrom2021 } from '@/utilities/GetCloudflareItems/getCumulativeZoneCountFrom2021'

type StatsBlockProps = {
  statBlocks: string[]
}

export const StatsBlock: React.FC<StatsBlockProps> = async ({ statBlocks }) => {
  const buildTime: string = new Date().toLocaleString('et-ET', { timeZone: 'Europe/Tallinn' })

  const TotalBandwidthAndRequestsStats = await getCloudflareGlobalStats()
  const TotalNumberOfSitesStats = await getCumulativeZoneCountFrom2021()

  return (
    <StatsBlockClient
      totalBandwidthAndRequestsStats={TotalBandwidthAndRequestsStats}
      totalNumberOfSitesStats={TotalNumberOfSitesStats}
      buildTime={buildTime}
      statBlocks={statBlocks}
    />
  )
}
