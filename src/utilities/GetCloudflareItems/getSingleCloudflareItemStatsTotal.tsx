export async function getSingleCloudflareItemStatsTotal(id: string | number) {
  if (!id) return null

  try {
    if (!process.env.CLOUDFLARE_EKLIPS) {
      throw new Error('CLOUDFLARE_EKLIPS is not set in environment variables.')
    }

    const headers = {
      Authorization: `Bearer ${process.env.CLOUDFLARE_EKLIPS}`,
      'Content-Type': 'application/json',
    }

    const now = new Date()
    const days = 10
    const dailyStats = []

    for (let i = 0; i < days; i++) {
      const end = new Date(now)
      end.setUTCHours(0, 0, 0, 0)
      end.setUTCDate(end.getUTCDate() - i)

      const start = new Date(end)
      start.setUTCDate(start.getUTCDate() - 1)

      const startTime = start.toISOString()
      const endTime = end.toISOString()

      const graphqlQuery = {
        query: `
          {
            viewer {
              zones(filter: {zoneTag: "${id}"}) {
                daily: httpRequests1hGroups(limit: 24, filter: {datetime_geq: "${startTime}", datetime_lt: "${endTime}"}) {
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

      if (!response.ok) {
        console.error(`Cloudflare API error for day ${i}:`, data)
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const dayStats = data?.data?.viewer?.zones?.[0]?.daily || []
      const totalRequests = dayStats.reduce((sum: any, hour: any) => sum + (hour?.sum?.requests || 0), 0)
      const totalBytes = dayStats.reduce((sum: any, hour: any) => sum + (hour?.sum?.bytes || 0), 0)

      dailyStats.push({
        date: start.toISOString().split('T')[0], // YYYY-MM-DD
        requests: totalRequests,
        bandwidth: totalBytes
      })
    }

    // Optional: reverse to get chronological order (oldest first)
    return dailyStats.reverse()
  } catch (error) {
    console.error(`Error fetching Cloudflare stats for zone ${id}:`, error)
    return null
  }
}
