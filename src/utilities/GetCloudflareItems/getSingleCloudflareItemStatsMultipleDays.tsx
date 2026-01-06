import { getCwaasZoneId } from '@/utilities/GetCloudflareItems/getCwaasZone'

type CloudflareAdaptiveGroup = {
  count?: number
  dimensions?: { datetime?: string; clientRequestPath?: string; clientRequestHTTPHost?: string }
  sum?: { edgeResponseBytes?: number }
  avg?: { originResponseDurationMs?: number; edgeTimeToFirstByteMs?: number }
}

export async function getSingleCloudflareItemStatsMultipleDays(hostname: string) {
  if (!hostname) return null

  if (!hostname.includes('.')) {
    console.warn('Cloudflare stats (multi) skipped: hostname is not valid.', hostname)
    return null
  }

  try {
    if (!process.env.CLOUDFLARE_EKLIPS) {
      throw new Error('CLOUDFLARE_EKLIPS is not set in environment variables.')
    }

    const zoneId = await getCwaasZoneId()
    if (!zoneId) {
      throw new Error('Could not resolve cwaas.site zone.')
    }

    const headers = {
      Authorization: `Bearer ${process.env.CLOUDFLARE_EKLIPS}`,
      'Content-Type': 'application/json',
    }

    const normalizedHostname = hostname.trim().toLowerCase()
    const alternateHostname = normalizedHostname.startsWith('www.')
      ? normalizedHostname.replace(/^www\./, '')
      : `www.${normalizedHostname}`
    const hostSections = [
      { label: 'primary', host: normalizedHostname },
      ...(alternateHostname && alternateHostname !== normalizedHostname
        ? [{ label: 'alternate', host: alternateHostname }]
        : []),
    ]

    const endDate = new Date()
    const startDate = new Date()
    startDate.setHours(endDate.getHours() - 24)

    const formattedStartDate = startDate.toISOString()
    const formattedEndDate = endDate.toISOString()

    const buildHostQuery = (label: string, host: string, includeCount: boolean) => {
      const countField = includeCount ? 'count' : ''
      const groupLimit = 10000

      return `
        ${label}: httpRequestsAdaptiveGroups(
          limit: ${groupLimit}
          filter: { datetime_geq: "${formattedStartDate}", datetime_lt: "${formattedEndDate}", clientRequestHTTPHost: "${host}" }
        ) {
          ${countField}
          dimensions {
            datetime
          }
          sum {
            edgeResponseBytes
          }
          avg {
            originResponseDurationMs
            edgeTimeToFirstByteMs
          }
        }
      `
    }

    const buildQuery = (includeCount: boolean) => ({
      query: `
      {
        viewer {
          zones(filter: {zoneTag: "${zoneId}"}) {
            ${hostSections.map((section) => buildHostQuery(section.label, section.host, includeCount)).join('\n')}
          }
        }
      }
    `,
    })

    const buildPathQuery = (includeOrderBy: boolean) => {
      const orderBySection = includeOrderBy ? 'orderBy: [sum_edgeResponseBytes_DESC]' : ''

      return {
        query: `
        {
          viewer {
            zones(filter: {zoneTag: "${zoneId}"}) {
              ${hostSections
                .map(
                  (section) => `
                  ${section.label}Paths: httpRequestsAdaptiveGroups(
                    limit: 50
                    filter: { datetime_geq: "${formattedStartDate}", datetime_lt: "${formattedEndDate}", clientRequestHTTPHost: "${section.host}" }
                    ${orderBySection}
                  ) {
                    dimensions {
                      clientRequestPath
                    }
                    sum {
                      edgeResponseBytes
                    }
                  }
                `,
                )
                .join('\n')}
            }
          }
        }
      `,
      }
    }

    const fetchStats = async (includeCount: boolean) => {
      const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify(buildQuery(includeCount)),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(`Cloudflare GraphQL API Error: ${JSON.stringify(data, null, 2)}`)
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const hasCountError = data?.errors?.some((error: { message?: string }) =>
        (error?.message || '').toLowerCase().includes('unknown field "count"'),
      )

      if (hasCountError && includeCount) {
        return fetchStats(false)
      }

      if (data?.errors?.length) {
        console.error(`Cloudflare GraphQL API Error: ${JSON.stringify(data, null, 2)}`)
        throw new Error('Cloudflare GraphQL error response')
      }

      return data
    }

    const fetchPathData = async (includeOrderBy: boolean) => {
      const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify(buildPathQuery(includeOrderBy)),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(`Cloudflare GraphQL API Error: ${JSON.stringify(data, null, 2)}`)
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const hasOrderByError = data?.errors?.some((error: { message?: string }) =>
        (error?.message || '').toLowerCase().includes('orderby'),
      )

      if (hasOrderByError && includeOrderBy) {
        return fetchPathData(false)
      }

      if (data?.errors?.length) {
        console.error(`Cloudflare GraphQL API Error: ${JSON.stringify(data, null, 2)}`)
        return null
      }

      return data
    }

    const data = await fetchStats(true)
    const results: CloudflareAdaptiveGroup[] = hostSections.flatMap(
      (section) => data?.data?.viewer?.zones?.[0]?.[section.label] || [],
    )

    if (!results.length) {
      return null
    }

    const groupedMap = new Map<string, { requests: number; bytes: number }>()

    results.forEach((entry) => {
      const dateTime = entry?.dimensions?.datetime
      if (!dateTime) return

      const parsedDate = new Date(dateTime)
      if (Number.isNaN(parsedDate.getTime())) return

      parsedDate.setUTCMinutes(0, 0, 0)
      const bucket = parsedDate.toISOString()

      const existing = groupedMap.get(bucket) || { requests: 0, bytes: 0 }
      groupedMap.set(bucket, {
        requests: existing.requests + (entry?.count || 0),
        bytes: existing.bytes + (entry?.sum?.edgeResponseBytes || 0),
      })
    })

    const groupedData = Array.from(groupedMap.entries())
      .map(([dateTime, totals]) => ({
        dateTime,
        requests: totals.requests,
        bandwidth: totals.bytes / (1024 * 1024 * 1024),
      }))
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime))

    const totalRequests = groupedData.reduce((acc, entry) => acc + entry.requests, 0)
    const totalBandwidth = groupedData.reduce((acc, entry) => acc + entry.bandwidth, 0)
    const pathResponse = await fetchPathData(true)
    const pathEntries: CloudflareAdaptiveGroup[] = pathResponse
      ? hostSections.flatMap(
          (section) => pathResponse?.data?.viewer?.zones?.[0]?.[`${section.label}Paths`] || [],
        )
      : []
    const pathMap = new Map<
      string,
      {
        sum: { edgeResponseBytes: number }
        avg: { edgeTimeToFirstByteMs: number; originResponseDurationMs: number }
      }
    >()

    pathEntries.forEach((entry) => {
      const path = entry?.dimensions?.clientRequestPath
      if (!path) return

      const bytes = entry?.sum?.edgeResponseBytes || 0
      const existing = pathMap.get(path)
      if (!existing) {
        pathMap.set(path, {
          sum: { edgeResponseBytes: bytes },
          avg: {
            edgeTimeToFirstByteMs: 0,
            originResponseDurationMs: 0,
          },
        })
        return
      }

      const nextBytes = existing.sum.edgeResponseBytes + bytes
      const shouldReplaceAvg = bytes > existing.sum.edgeResponseBytes
      pathMap.set(path, {
        sum: { edgeResponseBytes: nextBytes },
        avg: shouldReplaceAvg
          ? {
              edgeTimeToFirstByteMs: 0,
              originResponseDurationMs: 0,
            }
          : existing.avg,
      })
    })

    const pathData = Array.from(pathMap.entries())
      .map(([clientRequestPath, data]) => ({
        dimensions: { clientRequestPath },
        sum: data.sum,
        avg: data.avg,
      }))
      .sort((a, b) => (b.sum.edgeResponseBytes || 0) - (a.sum.edgeResponseBytes || 0))

    return {
      groupedData,
      totalRequests,
      totalBandwidth,
      pathData,
    }
  } catch (error) {
    console.error(`Error fetching Cloudflare GraphQL stats for hostname ${hostname}:`, error)
    return null
  }
}
