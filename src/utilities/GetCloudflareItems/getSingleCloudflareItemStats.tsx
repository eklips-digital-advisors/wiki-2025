import { getCwaasZoneId } from '@/utilities/GetCloudflareItems/getCwaasZone'

type CloudflareAdaptiveGroup = {
  count?: number
  sum?: { edgeResponseBytes?: number }
}

export async function getSingleCloudflareItemStats(hostname: string) {
  if (!hostname) return null

  if (!hostname.includes('.')) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Cloudflare stats skipped: hostname is not valid.', hostname)
    }
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

    const now = new Date()
    const past24Hours = new Date()
    past24Hours.setHours(now.getHours() - 24)

    const past48Hours = new Date(past24Hours)
    past48Hours.setHours(past48Hours.getHours() - 24)

    const nowTime = now.toISOString()
    const twentyFourTime = past24Hours.toISOString()
    const fourtyEightTime = past48Hours.toISOString()

    const buildHostQuery = (label: string, host: string, includeCount: boolean) => {
      const countField = includeCount ? 'count' : ''
      const groupLimit = 10000

      return `
        ${label}TwentyFour: httpRequestsAdaptiveGroups(limit: ${groupLimit}, filter: {datetime_geq: "${twentyFourTime}", datetime_lt: "${nowTime}", clientRequestHTTPHost: "${host}"}) {
          ${countField}
          sum {
            edgeResponseBytes
          }
        }
        ${label}FourtyEight: httpRequestsAdaptiveGroups(limit: ${groupLimit}, filter: {datetime_geq: "${fourtyEightTime}", datetime_lt: "${twentyFourTime}", clientRequestHTTPHost: "${host}"}) {
          ${countField}
          sum {
            edgeResponseBytes
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

    const data = await fetchStats(true)

    const sumBy = (entries: CloudflareAdaptiveGroup[]) => {
      return entries.reduce(
        (acc, entry) => {
          acc.requests += entry?.count || 0
          acc.bytes += entry?.sum?.edgeResponseBytes || 0
          return acc
        },
        { requests: 0, bytes: 0 },
      )
    }

    const twentyFourGroups: CloudflareAdaptiveGroup[] = hostSections.flatMap(
      (section) => data?.data?.viewer?.zones?.[0]?.[`${section.label}TwentyFour`] || [],
    )
    const fourtyEightGroups: CloudflareAdaptiveGroup[] = hostSections.flatMap(
      (section) => data?.data?.viewer?.zones?.[0]?.[`${section.label}FourtyEight`] || [],
    )

    const resultTwentyFour = sumBy(twentyFourGroups)
    const resultFourtyEight = sumBy(fourtyEightGroups)

    const previousBytes = resultFourtyEight?.bytes || 0
    const percentageBandWidth =
      previousBytes > 0 ? (((resultTwentyFour?.bytes || 0) - previousBytes) / previousBytes) * 100 : 0

    return {
      requests: resultTwentyFour?.requests || 0,
      bandwidth: (resultTwentyFour?.bytes || 0) / (1024 * 1024 * 1024),
      percentageBandWidth,
    }
  } catch (error) {
    console.error(`Error fetching Cloudflare GraphQL stats for hostname ${hostname}:`, error)
    return null
  }
}
