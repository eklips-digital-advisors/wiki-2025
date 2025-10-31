'use client'

import React, { useEffect, useState } from 'react'
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Clock, Database,
  ExternalLink,
  ExternalLinkIcon,
  FileDown,
  LoaderCircle,
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
import PathTable from '@/blocks/SitesBlock/PathTable'
import CspTable from '@/blocks/SitesBlock/CspTable'
import CheckIcon from '@/blocks/SitesBlock/CheckIcon'
import { exportToExcel } from '@/utilities/exportToExcel'
import { parseDateUTC } from '@/utilities/parseDateUTC'
import SecondarySearch from '@/components/SearchSecondary'
import { ChartPerformance } from '@/blocks/SitesBlock/ChartPerformance'
import { getLabel } from '@/utilities/getLabel'
import { frameworkOptions, wcagOptions } from '@/collections/Sites/selectOptions'
import FontsTable from '@/blocks/SitesBlock/FontsTable'

export const SitesBlockClient: React.FC<SitesBlockProps> = ({ sites, extraInfo }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pullText, setPullText] = useState('Pull new data')
  const [searchValue, setSearchValue] = useState('')
  const { latestWp, wpVersionLatestPercentage, phpApiData, buildTime } = extraInfo
  
  console.log('sites', sites)

  const revalidate = async () => {
    setLoading(true)
    setPullText('Pulling, please wait...')
    await fetch('/next/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: '/sites' }), // Pass the path dynamically
    });
    router.refresh()
  }

  useEffect(() => {
    setLoading(false)
    setPullText('Pull new data')
  }, [buildTime])

  const handleChange = (e: any) => {
    e.target.addEventListener('keyup', function () {
      const value = e.target.value.toLowerCase()
      setSearchValue(value)
    })
  }

  const [selectedColumns, setSelectedColumns] = useState(
    columns.filter((col) => col.defaultVisible).map((col) => col.key),
  )

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key],
    )
  }

  const clearAllColumns = () => {
    setSelectedColumns((prev) => prev.filter((col) => col === "index" || col === "title"));
  };

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: 'title',
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

    const isDateFormat = (value: string) => /^\d{2}\.\d{2}\.\d{4}$/.test(value);

    const isADate = isDateFormat(aValue);
    const isBDate = isDateFormat(bValue);

    if (isADate && isBDate) {
      const dateA = parseDateUTC(aValue);
      const dateB = parseDateUTC(bValue);

      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0; // Handle as equal if dates are invalid
      }

      return sortConfig.direction === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }

    if (sortConfig.key === "dataProvider") {
      const aScore = aValue ? Object.values(aValue).filter(Boolean).length : 0;
      const bScore = bValue ? Object.values(bValue).filter(Boolean).length : 0;

      return sortConfig.direction === 'asc' ? aScore - bScore : bScore - aScore;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div>
      <div className="text-sm flex flex-wrap items-center gap-4">
        <div className="bg-zinc-800 text-white rounded-md px-2">
          {sites?.length} sites in total
        </div>
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
          className={`cursor-pointer pr-0 underline inline-flex gap-1 items-center relative ${!loading ? 'pl-0' : 'pl-5'}`}
          onClick={revalidate}
        >
          {loading && <LoaderCircle className="w-4 h-4 animate-spin absolute left-0 top-1/2 -translate-y-1/2" />}
          {pullText}
        </Button>
        {buildTime && (
          <p className="text-zinc-500">Last update: {buildTime}</p>
        )}
        <Button
          variant="link"
          size="sm"
          className="ml-auto px-0 cursor-pointer underline"
          onClick={clearAllColumns}
        >
          Clear all filters
        </Button>
        <div className="flex items-center gap-2">
          <SecondarySearch handleChange={handleChange} />
          <Button
            className="cursor-pointer p-0"
            title="Export to Excel"
            variant="link"
            size="sm"
            onClick={() => exportToExcel(sites)}
          >
            <FileDown className="w-5 transition text-emerald-500 hover:text-emerald-400" />
          </Button>
        </div>
      </div>
      <div className="pill-container bg-white pt-8 mb-8 flex gap-1 flex-wrap sticky z-10">
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
            {sortedSites
              .filter(site => site.title.toLowerCase().includes(searchValue))
              .map((site, index) => (
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
                    {site?.production && (
                      <Link target="_blank" href={site?.production}>
                        <ExternalLink className="w-4" />
                      </Link>
                    )}
                  </td>
                )}
                {selectedColumns.includes('staging') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.staging && site?.stagingLink && (
                      <div className="flex gap-2 items-center">
                        <Link
                          title="Stage URL"
                          target="_blank"
                          href={site?.staging}
                        >
                          <ExternalLink className="w-4" />
                        </Link>
                        <Link
                          title="Repository link"
                          target="_blank"
                          href={site?.stagingLink}
                        >
                          <Database className="w-4" />
                        </Link>
                      </div>
                    )}
                  </td>
                )}
                {selectedColumns.includes('createdAt') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.createdAt && site?.createdAt}
                  </td>
                )}
                {selectedColumns.includes('lastCommitAt') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.lastCommitAt && site?.lastCommitAt}
                  </td>
                )}
                {selectedColumns.includes('productionDate') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.productionDate && site?.productionDate}
                  </td>
                )}
                {selectedColumns.includes('siteService') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.siteService}
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
                      <span className="text-xs"><CloudFlare className="w-12" /> {site.cloudflarePlan}</span>
                    ) : (
                      site?.cloudflare
                    )}
                  </td>
                )}
                {selectedColumns.includes('ssl') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">{site?.ssl}</td>
                )}
                {selectedColumns.includes('ipRestriction') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    <CheckIcon condition={site?.ipRestriction} />
                  </td>
                )}
                {selectedColumns.includes('csp') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.csp && <CspTable cspData={site?.csp} />}
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
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500 uppercase`}>
                    {getLabel(site?.framework, frameworkOptions)}
                  </td>
                )}
                {selectedColumns.includes('twoFa') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    <CheckIcon condition={site?.twoFa} />
                  </td>
                )}
                {selectedColumns.includes('hiddenLogin') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    <CheckIcon condition={site?.hiddenLogin} />
                  </td>
                )}
                {selectedColumns.includes('hasSolr') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    <CheckIcon condition={site?.hasSolr} />
                  </td>
                )}
                {selectedColumns.includes('pressReleases') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    <span className="flex gap-1 flex-wrap">
                      {(Array.isArray(site?.pressReleases) && site.pressReleases.includes('cision')) ? (
                        <span className="px-1 py-[0.5] text-xs inline-block bg-orange-100">
                          Cision
                        </span>
                      ) : null}

                      {(Array.isArray(site?.pressReleases) && site.pressReleases.includes('mfn')) ? (
                        <span className="px-1 py-[0.5] text-xs inline-block bg-green-100">
                          MFN
                        </span>
                      ) : null}

                      {(Array.isArray(site?.pressReleases) && site.pressReleases.includes('bequoted')) ? (
                        <span className="px-1 py-[0.5] text-xs inline-block bg-indigo-100">
                          BeQuoted
                        </span>
                      ) : null}
                    </span>
                  </td>
                )}
                {selectedColumns.includes('dataProvider') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    <span className="flex gap-1 flex-wrap">
                      {site?.dataProvider.cisionBlocks && (
                        <span className="px-1 py-[0.5] text-xs inline-block bg-orange-100">
                          CisionBlocks
                        </span>
                      )}
                      {site?.dataProvider.dataBlocks && (
                        <span className="px-1 py-[0.5] text-xs inline-block bg-green-100">DataBlocks</span>
                      )}
                    </span>
                  </td>
                )}
                {selectedColumns.includes('hasGoogleAnalytics') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    {site?.hasGoogleAnalytics}
                  </td>
                )}
                {selectedColumns.includes('cookieProvider') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    {site?.cookieProvider}
                  </td>
                )}
                {selectedColumns.includes('fonts') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm text-zinc-500`}>
                    <FontsTable fonts={site?.fonts} />
                  </td>
                )}
                {selectedColumns.includes('wcagLevel') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500 uppercase">
                    <strong className="block leading-4">{getLabel(site?.wcagLevel, wcagOptions)}</strong>
                    <span className="leading-4">{site?.wcagUpdated && new Date(site?.wcagUpdated).toISOString().split('T')[0]}{' '}</span>
                  </td>
                )}
                {selectedColumns.includes('bsScan') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.bsScan && (
                      <span
                        className={`${getBsScanBackground(site?.bsScan)} px-1 py-[0.5] text-xs inline-block`}
                      >
                        {site?.bsScan}
                      </span>
                    )}
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
                {selectedColumns.includes('cloudflarePercentage') && (
                  <td className={`whitespace-nowrap px-3 py-3 text-sm`}>
                    <span className="flex gap-2 items-center">
                      <span
                        className={`${site?.cloudflarePercentage > 25 ? 'text-rose-400' : 'text-zinc-500'}`}
                      >
                        {site?.cloudflareBandwidth &&
                          site?.cloudflareRequests &&
                          site?.cloudflarePercentage &&
                          `${site?.cloudflareBandwidth} (${site?.cloudflarePercentage}%) / ${site?.cloudflareRequests}`}
                      </span>

                      {site.singleClodflareAnalyticsMultipleDays && site.cloudflarePlan === 'Enterprise Website' ? (
                        <>
                          <Chart siteChartData={site.singleClodflareAnalyticsMultipleDays} />
                          <ChartPerformance siteChartData={site.singleClodflareAnalyticsMultipleDays} />
                          <PathTable siteChartData={site.singleClodflareAnalyticsMultipleDays} />
                        </>
                      ) : (
                        <span className="text-zinc-500 sr-only">No data</span>
                      )}
                      {site?.singleClodflareUrl && (
                        <Link target="_blank" href={site?.singleClodflareUrl}>
                          <ExternalLink className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                        </Link>
                      )}
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
