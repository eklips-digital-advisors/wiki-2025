import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
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
  const payload = await getPayload({ config: configPromise })
  const buildTime: string = new Date().toLocaleString('et-ET', { timeZone: "Europe/Tallinn" })

  const sites = await payload.find({
    collection: 'sites',
    limit: -1,
  });

  const combinedStats: DayStat[] = Array.from({ length: 10 }, () => ({
    date: '',
    requests: 0,
    bandwidth: 0,
  }))
  
  const cfStat = (
    await Promise.all(
      sites?.docs.map(async site => {
        const cfId = site?.integrations?.cloudflare
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
