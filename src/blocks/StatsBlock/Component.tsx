import React from 'react'
import { getSingleCloudflareItemStatsTotal } from '@/utilities/GetCloudflareItems/getSingleCloudflareItemStatsTotal'
import { StatsBlockClient } from '@/blocks/StatsBlock/Component.client'

type DayStat = {
  date: string;
  requests: number;
  bandwidth: number;
}

type StatsBlockProps = {
  titleHeading: string
}

export const StatsBlock: React.FC<StatsBlockProps> = async ({titleHeading}) => {
  const buildTime: string = new Date().toLocaleString('et-ET', { timeZone: "Europe/Tallinn" })

  async function getAllCloudflareZones() {
    const allZones = []
    let page = 1
    const perPage = 50 // max is 50
    let totalPages = 1
  
    while (page <= totalPages) {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones?page=${page}&per_page=${perPage}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_EKLIPS}`,
          'Content-Type': 'application/json',
        },
      })
  
      const json = await response.json()
  
      if (!json.success) {
        throw new Error('Failed to fetch zones: ' + JSON.stringify(json.errors))
      }
  
      allZones.push(...json.result)
  
      if (page === 1) {
        totalPages = json.result_info.total_pages
      }
  
      page++
    }
  
    return allZones
  }
  const zones = await getAllCloudflareZones()

  const combinedStats: DayStat[] = Array.from({ length: 10 }, () => ({
    date: '',
    requests: 0,
    bandwidth: 0,
  }))
  
  const cfStat = (
    await Promise.all(
      zones.map(async site => {
        const cfId = site?.id
        if (cfId) {
          return await getSingleCloudflareItemStatsTotal(cfId)
        }
        return null
      })
    )
  ).filter(Boolean)

  cfStat.forEach((siteStats: DayStat[] | null) => {
    if (!siteStats) return

    siteStats.forEach((dayStat, index) => {
      if (!combinedStats[index].date) {
        combinedStats[index].date = dayStat.date
      }
      combinedStats[index].requests += dayStat.requests
      combinedStats[index].bandwidth += dayStat.bandwidth
    })
  })

  return (
    <StatsBlockClient combinedStats={combinedStats} buildTime={buildTime} titleHeading={titleHeading} />
  )
}
