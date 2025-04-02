'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'
import TotalBandwidthAndRequests from '@/blocks/StatsBlock/TotalBandwidthAndRequests'
import TotalNumberOfSites from '@/blocks/StatsBlock/TotalNumberOfSites'
import {usePathname} from "next/navigation";
import { revalidatePathOnClient } from '@/utilities/revalidatePathOnClient'

export const StatsBlockClient = ({
  totalBandwidthAndRequestsStats,
  totalNumberOfSitesStats,
  buildTime,
  statBlocks,
}: {
  totalBandwidthAndRequestsStats: any
  totalNumberOfSitesStats: any
  buildTime: string
  statBlocks: string[]
}) => {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pullText, setPullText] = useState('Pull new data')
  const revalidate = async () => {
    setLoading(true)
    setPullText('Pulling, please wait...')

    const success = await revalidatePathOnClient(pathname)
    if (success) {
      router.refresh()
    }
  }

  useEffect(() => {
    setLoading(false)
    setPullText('Pull new data')
  }, [buildTime])

  const blockComponents = {
    totalBandwidthAndRequests: TotalBandwidthAndRequests,
    numberOfSites: TotalNumberOfSites,
  }

  return (
    <div className="prose">
      <div className="text-sm flex flex-wrap items-center gap-4">
        <Button
          variant="link"
          size="sm"
          className="cursor-pointer p-0 underline inline-flex gap-1 items-center"
          onClick={revalidate}
        >
          {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
          {pullText}
        </Button>
        {buildTime && (
          <p className="text-zinc-500">Last update: {buildTime}</p>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {statBlocks?.length && statBlocks.map((block: any, index: number) => {
          const { type } = block

          if (type && type in blockComponents) {
            // @ts-ignore
            const Block = blockComponents[type]

            if (Block) {
              let extraProps = {}

              if (type === 'numberOfSites') {
                extraProps = { nrOfSitesData: totalNumberOfSitesStats }
              }

              if (type === 'totalBandwidthAndRequests') {
                extraProps = { siteChartData: totalBandwidthAndRequestsStats }
              }

              return (
                <div className="" key={index}>
                  <h2 className="mb-6">{block?.titleHeading}</h2>
                  <Block {...block} {...extraProps} />
                </div>
              )
            }
          }
          return null
        })}
      </div>
    </div>
  )
}
