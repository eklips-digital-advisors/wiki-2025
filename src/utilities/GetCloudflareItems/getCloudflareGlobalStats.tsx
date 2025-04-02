export async function getCloudflareGlobalStats(days: number = 10) {

  if (!process.env.CLOUDFLARE_EKLIPS) {
    throw new Error('CLOUDFLARE_EKLIPS is not set in environment variables.')
  }

  const headers = {
    Authorization: `Bearer ${process.env.CLOUDFLARE_EKLIPS}`,
    'Content-Type': 'application/json',
  }

  // Step 1: Get all zone IDs
  async function fetchAllZoneIds(): Promise<string[]> {
    let page = 1
    let allZoneIds: string[] = []

    while (true) {
      const res = await fetch(`https://api.cloudflare.com/client/v4/zones?page=${page}&per_page=50`, { headers })
      const json = await res.json()

      if (!json.success) throw new Error(`Failed to fetch zones: ${JSON.stringify(json.errors)}`)

      const zoneIds = json.result.map((z: any) => z.id)
      allZoneIds = allZoneIds.concat(zoneIds)

      if (json.result_info.page >= json.result_info.total_pages) break
      page++
    }

    return allZoneIds
  }

  const allZoneIds = await fetchAllZoneIds()
  const dailyStats: { date: string; requests: number; bandwidth: number }[] = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    const end = new Date(now)
    end.setUTCHours(0, 0, 0, 0)
    end.setUTCDate(end.getUTCDate() - i)

    const dateString = end.toISOString().split('T')[0] // YYYY-MM-DD
    let totalRequests = 0
    let totalBytes = 0

    for (let j = 0; j < allZoneIds.length; j += 10) {
      const zoneBatch = allZoneIds.slice(j, j + 10)

      const graphqlQuery = {
        query: `
          {
            viewer {
              zones(filter: {zoneTag_in: [${zoneBatch.map(id => `"${id}"`).join(', ')}]}) {
                httpRequests1dGroups(limit: 1, filter: {date: "${dateString}"}) {
                  sum {
                    requests
                    bytes
                  }
                }
              }
            }
          }
        `,
      }

      const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify(graphqlQuery),
      })

      const data = await response.json()

      if (!response.ok || !data.data?.viewer) {
        console.error(`Cloudflare API error for ${dateString}, batch ${j / 10 + 1}:`, data)
        throw new Error(`Failed fetching batch stats for ${dateString}`)
      }

      const zones = data.data.viewer.zones || []
      for (const zone of zones) {
        const daily = zone.httpRequests1dGroups || []
        for (const day of daily) {
          totalRequests += day?.sum?.requests || 0
          totalBytes += day?.sum?.bytes || 0
        }
      }
    }

    dailyStats.push({
      date: dateString,
      requests: totalRequests,
      bandwidth: totalBytes,
    })
  }

  return dailyStats.reverse()
}
