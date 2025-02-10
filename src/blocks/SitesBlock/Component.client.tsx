'use client'

import React, { useEffect, useState } from 'react'
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  ExternalLinkIcon, LoaderCircle,
} from 'lucide-react'
import Link from 'next/link'
import Th from '@/components/Table/Th'
import { getWpVersionBackground } from '@/utilities/GetDynamicBackgrounds/getWpVersionBackground'
import CloudFlare from '@/components/Icons/cloudFlare'
import { SiteItem, SitesBlockProps } from '@/blocks/SitesBlock/sites-types'
import './index.scss'
import Pill from '@/components/Button/pill'
import { columns } from '@/blocks/SitesBlock/Columns'
import { getPhpBackground } from '@/utilities/GetDynamicBackgrounds/getPhpBackground'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { getBsScanBackground } from '@/utilities/GetDynamicBackgrounds/getBsScanBackground'
import Chart from '@/blocks/SitesBlock/Chart'
import { formatDateTime } from '@/utilities/formatDateTime'
import PathTable from '@/blocks/SitesBlock/PathTable'

export const SitesBlockClient: React.FC<SitesBlockProps> = ({ sites, extraInfo }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { latestWp, wpVersionLatestPercentage, phpApiData, buildTime } = extraInfo

  const revalidate = async () => {
    setLoading(true)
    await fetch('/next/revalidate', { method: 'POST' })
    router.refresh()
  }

  useEffect(() => {
    setLoading(false)
  }, [buildTime])

  const [selectedColumns, setSelectedColumns] = useState(
    columns.filter((col) => col.defaultVisible).map((col) => col.key),
  )

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key],
    )
  }

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  })

  // Toggle column sorting
  const toggleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }
  // Sort sites dynamically
  const sortedSites = [...sites].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key as keyof SiteItem] as string
    const bValue = b[sortConfig.key as keyof SiteItem] as string

    // Check if the values are in the correct date-time format (YYYY/MM/DD HH:mm:ss Z)
    const dateRegex = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} [+-]\d{4}$/

    const isDateFormat = dateRegex.test(aValue) && dateRegex.test(bValue)

    if (isDateFormat) {
      const dateA = new Date(aValue)
      const dateB = new Date(bValue)

      return sortConfig.direction === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime()
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div>
      <div className="mb-10 text-sm flex flex-wrap items-center gap-4">
        <div className="">
          Latest WP <span className="bg-emerald-100 px-1 py-[2px] leading-[1]">{latestWp}</span> (
          <Link href="https://api.wordpress.org/core/version-check/1.7/" target="_blank">
            source
          </Link>
          )
        </div>
        <Button
          variant="link"
          size="sm"
          className="cursor-pointer underline inline-flex gap-1 items-center"
          onClick={revalidate}
        >
          {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
          {`Pull new data`}
        </Button>
        {buildTime && <p className="text-zinc-500">Last update: {buildTime.toLocaleString('et-ET')}</p>}
      </div>
      <div className="relative mb-8 flex gap-1 flex-wrap">
        {columns
          .filter((col) => col.key !== 'index')
          .map((col) => (
            <Pill
              key={col.key}
              active={selectedColumns.includes(col.key)}
              onClick={() => toggleColumn(col.key)}
              type={col.type}
            >
              <span>{col.label}</span>
            </Pill>
          ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto pb-24">
        <table className="min-w-full divide-y divide-zinc-300">
          <thead>
            <tr>
              {columns.map(
                (col) =>
                  selectedColumns.includes(col.key) && (
                    <Th
                      key={col.key}
                      className={`px-3 py-2 select-none ${col.sortable && 'cursor-pointer'}`}
                      onClick={() => col.sortable && toggleSort(col.key)}
                    >
                      <div className="flex items-center">
                        {col.label}
                        {col.sortable && sortConfig.key !== col.key && (
                          <ArrowUpDown className="ml-1 w-4 h-4" />
                        )}
                        {col.sortable && sortConfig.key === col.key && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4" />
                            )}
                          </span>
                        )}
                        {!col.auto && <span className="text-[10px] ml-1">M</span>}
                      </div>

                      {col.key === 'wpVersion' && (
                        <div className="inline-flex flex-wrap gap-1 text-xs">
                          <span className="bg-emerald-100 p-1 rounded inline-block leading-3">
                            {wpVersionLatestPercentage}%
                          </span>
                          <span className="bg-rose-100 p-1 rounded inline-block leading-3">
                            {(100 - wpVersionLatestPercentage).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </Th>
                  ),
              )}
            </tr>
          </thead>
          <tbody>
            {sortedSites.map((site, index) => (
              <tr key={site.id}>
                {selectedColumns.includes('index') && (
                  <td className="text-sm text-zinc-400">{index + 1}</td>
                )}
                {selectedColumns.includes('title') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-zinc-900">
                    {site.title}
                  </td>
                )}
                {selectedColumns.includes('production') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.hostname && (
                      <Link target="_blank" href={`https://${site?.hostname}`}>
                        <ExternalLink className="w-4" />
                      </Link>
                    )}
                  </td>
                )}
                {selectedColumns.includes('staging') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.repositoryName && (
                      <Link
                        target="_blank"
                        href={`https://${site?.repositoryName}.eklipsdevelopment.com`}
                      >
                        <ExternalLink className="w-4" />
                      </Link>
                    )}
                  </td>
                )}
                {selectedColumns.includes('createdAt') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.createdAt && formatDateTime(site?.createdAt)}
                  </td>
                )}
                {selectedColumns.includes('lastCommitAt') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.lastCommitAt && formatDateTime(site?.lastCommitAt)}
                  </td>
                )}
                {selectedColumns.includes('productionDate') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.productionDate &&
                      new Date(site?.productionDate * 1000).toLocaleDateString('et-ET', {
                        month: '2-digit',
                        year: 'numeric',
                        day: '2-digit',
                      })}
                  </td>
                )}
                {selectedColumns.includes('siteService') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site['site/service']}
                  </td>
                )}
                {selectedColumns.includes('hosting') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.hosting}
                  </td>
                )}
                {selectedColumns.includes('server') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.server}
                  </td>
                )}
                {selectedColumns.includes('wpVersion') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.wpVersion && (
                      <span
                        className={`${getWpVersionBackground(site?.wpVersion, latestWp)} px-1 py-[0.5] text-xs inline-block`}
                      >
                        {site?.wpVersion}
                      </span>
                    )}
                  </td>
                )}
                {selectedColumns.includes('cloudflare') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site.cloudflare === 'cloudflare' ? (
                      <CloudFlare className="w-12" />
                    ) : (
                      site?.cloudflare
                    )}
                  </td>
                )}
                {selectedColumns.includes('cloudflarePlan') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site.cloudflarePlan}
                  </td>
                )}
                {selectedColumns.includes('ssl') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">{site?.ssl}</td>
                )}
                {selectedColumns.includes('ipRestriction') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.ipRestriction && <Check className="w-4" />}
                  </td>
                )}
                {selectedColumns.includes('csp') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.csp && <Check className="w-4" />}
                  </td>
                )}
                {selectedColumns.includes('phpVersion') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    <span
                      className={`${getPhpBackground(phpApiData, site?.phpVersion)} px-1 py-[0.5] text-xs inline-block`}
                    >
                      {site?.phpVersion}
                    </span>
                  </td>
                )}
                {selectedColumns.includes('framework') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    {site?.framework}
                  </td>
                )}
                {selectedColumns.includes('twoFa') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.twoFa && <Check className="w-4" />}
                  </td>
                )}
                {selectedColumns.includes('hiddenLogin') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.hiddenLogin && <Check className="w-4" />}
                  </td>
                )}
                {selectedColumns.includes('hasSolr') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    {site?.hasSolr && <Check className="w-4" />}
                  </td>
                )}
                {selectedColumns.includes('pressReleases') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    <span className="flex gap-1 flex-wrap">
                      {site?.pressReleases.cision && (
                        <span className="px-1 py-[0.5] text-xs inline-block bg-orange-100">
                          Cision
                        </span>
                      )}
                      {site?.pressReleases.mfn && (
                        <span className="px-1 py-[0.5] text-xs inline-block bg-green-100">MFN</span>
                      )}
                    </span>
                  </td>
                )}
                {selectedColumns.includes('newsFeeds') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    {site?.newsFeeds}
                  </td>
                )}
                {selectedColumns.includes('dataBlocks') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    {site?.dataBlocks}
                  </td>
                )}
                {selectedColumns.includes('hasGoogleAnalytics') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    {site?.hasGoogleAnalytics && <Check className="w-4" />}
                  </td>
                )}
                {selectedColumns.includes('hasCookiebot') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    {site?.hasCookiebot && <Check className="w-4" />}
                  </td>
                )}
                {selectedColumns.includes('wcag') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500 uppercase">
                    {site?.wcagUpdated && new Date(site?.wcagUpdated).toISOString().split('T')[0]}{' '}
                    {site?.wcagLevel}
                  </td>
                )}
                {selectedColumns.includes('bsScan') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.bsScan && (
                      <span
                        className={`${getBsScanBackground(site?.bsScan)} px-1 py-[0.5] text-xs inline-block`}
                      >
                        {new Date(site?.bsScan).toISOString().split('T')[0]}
                      </span>
                    )}
                  </td>
                )}
                {selectedColumns.includes('speedTestScan') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    {site?.speedTestScan}
                  </td>
                )}
                {selectedColumns.includes('lastResponsetime') && (
                  <td
                    className={`whitespace-nowrap flex items-center gap-4 px-3 py-3 text-sm ${site?.lastResponsetime && site?.lastResponsetime > 2000 ? 'text-rose-500' : 'text-zinc-500'}`}
                  >
                    {site?.lastResponsetime && (
                      <span className="flex flex-col items-center">
                        <Clock className="w-4 h-4" />
                        {site?.lastResponsetime}
                      </span>
                    )}
                    {site?.pingdomLink && (
                      <Link target="_blank" href={site?.pingdomLink}>
                        <ExternalLinkIcon className="w-5 h-5" />
                      </Link>
                    )}
                  </td>
                )}
                {selectedColumns.includes('cloudflareBandwidth') && (
                  <td
                    className={`whitespace-nowrap px-3 py-3 text-sm`}
                  >
                    <span className="flex gap-2 items-center">
                      <span className={`${site?.cloudflareBandwidth > 5 ? 'text-yellow-500' : 'text-zinc-500'}`}>
                        {site?.cloudflareBandwidth &&
                          site?.cloudflareRequests &&
                          `${site?.cloudflareBandwidth} / ${site?.cloudflareRequests}`}
                      </span>

                      {site.singleClodflareAnalyticsMultipleDays ? (
                        <>
                          <Chart siteChartData={site.singleClodflareAnalyticsMultipleDays} />
                          <PathTable siteChartData={site.singleClodflareAnalyticsMultipleDays} />
                        </>
                      ) : (
                        <span className="text-zinc-500">No data</span>
                      )}
                      {site?.singleClodflareUrl && <Link target="_blank" href={site?.singleClodflareUrl}><ExternalLink className="w-5 h-5 text-gray-500 hover:text-gray-700" /></Link>}
                    </span>
                  </td>
                )}
                {/*Display graphs here*/}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SitesBlockClient
