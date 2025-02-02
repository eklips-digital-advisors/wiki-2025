'use client'

import React, { useState } from 'react'
import { Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Th from '@/components/Table/Th'
import { getWpVersionBackground } from '@/utilities/GetDynamicBackgrounds/getWpVersionBackground'
import CloudFlare from '@/components/Icons/cloudFlare'
import { SiteItem, SitesBlockProps } from '@/blocks/SitesBlock/sites-types'
import './index.scss'
import Pill from '@/components/Button/pill'

export const SitesBlockClient: React.FC<SitesBlockProps> = ({ sites, extraInfo }) => {
  const { latestWp, wpVersionLatestPercentage } = extraInfo

  const columns = [
    { key: 'index', label: '', defaultVisible: true, sortable: false },
    { key: 'title', label: 'Client', defaultVisible: true, sortable: true },
    { key: 'createdAt', label: 'Date of creation', defaultVisible: false, sortable: true },
    { key: 'lastCommitAt', label: 'Last commit', defaultVisible: false, sortable: true },
    { key: 'siteService', label: 'Site/Service', defaultVisible: true, sortable: true },
    { key: 'productionDate', label: 'Production date', defaultVisible: false, sortable: true },
    { key: 'production', label: 'Production', defaultVisible: true, sortable: false },
    { key: 'staging', label: 'Staging', defaultVisible: true, sortable: false },
    { key: 'wpVersion', label: 'WP Version', defaultVisible: true, sortable: true },
    { key: 'cloudflare', label: 'Cloudflare', defaultVisible: false, sortable: false },
    { key: 'cloudflarePlan', label: 'Cloudflare plan', defaultVisible: false, sortable: false },
    {
      key: 'cloudflareStats',
      label: 'Cloudflare past 24hrs bandwidth/requests',
      defaultVisible: false,
      sortable: false,
    },
    { key: 'ssl', label: 'SSL', defaultVisible: false, sortable: false },
    { key: 'twoFa', label: '2FA', defaultVisible: false, sortable: false },
    { key: 'hiddenLogin', label: 'Hidden login', defaultVisible: false, sortable: false },
    { key: 'ipRestriction', label: 'IP Restriction', defaultVisible: false, sortable: false },
    { key: 'csp', label: 'CSP', defaultVisible: false, sortable: false },
    { key: 'wcag', label: 'WCAG', defaultVisible: false, sortable: false },
    { key: 'bsScan', label: 'BS Scan', defaultVisible: false, sortable: false },
    { key: 'phpVersion', label: 'PHP version', defaultVisible: false, sortable: false },
  ]

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
      console.log('is date')
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
      <div className="relative mb-4 flex gap-2 flex-wrap">
        {columns
          .filter((col) => col.key !== 'index')
          .map((col) => (
            <Pill
              key={col.key}
              active={selectedColumns.includes(col.key)}
              onClick={() => toggleColumn(col.key)}
            >
              <span>{col.label}</span>
            </Pill>
          ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
                        {col.sortable && sortConfig.key === col.key && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                        )}
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
                {selectedColumns.includes('createdAt') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.createdAt && site?.createdAt.split(' ')[0]}
                  </td>
                )}
                {selectedColumns.includes('lastCommitAt') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.lastCommitAt && site?.lastCommitAt.split(' ')[0]}
                  </td>
                )}
                {selectedColumns.includes('siteService') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site['site/service']}
                  </td>
                )}
                {selectedColumns.includes('productionDate') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {new Date(site['productionDate'] * 1000).toLocaleDateString()}
                  </td>
                )}
                {selectedColumns.includes('production') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    <Link target="_blank" href={`https://${site?.hostname}`}>
                      <ExternalLink className="w-4" />
                    </Link>
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
                {selectedColumns.includes('cloudflareStats') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.cloudflareBandwidth &&
                      site?.cloudflareRequests &&
                      `${site?.cloudflareBandwidth}MB/${site?.cloudflareRequests}`}
                  </td>
                )}
                {selectedColumns.includes('ssl') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.ssl}
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
                {selectedColumns.includes('wcag') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500 uppercase">
                    {site?.wcagUpdated && new Date(site?.wcagUpdated).toISOString().split("T")[0]} {site?.wcagLevel}
                  </td>
                )}
                {selectedColumns.includes('bsScan') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.bsScan && new Date(site?.bsScan).toISOString().split("T")[0]}
                  </td>
                )}
                {selectedColumns.includes('phpVersion') && (
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">
                    {site?.phpVersion}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SitesBlockClient
