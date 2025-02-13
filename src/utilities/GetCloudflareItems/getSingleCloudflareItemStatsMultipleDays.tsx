export async function getSingleCloudflareItemStatsMultipleDays(id: string | number) {
  if (!id) return null

  try {
    if (!process.env.CLOUDFLARE_EKLIPS) {
      throw new Error('CLOUDFLARE_EKLIPS is not set in environment variables.')
    }

    const headers = {
      Authorization: `Bearer ${process.env.CLOUDFLARE_EKLIPS}`,
      'Content-Type': 'application/json',
    }

    // Get date range for the last 48 hours
    const endDate = new Date()
    const startDate = new Date()
    startDate.setHours(endDate.getHours() - 24)

    const formattedStartDate = startDate.toISOString()
    const formattedEndDate = endDate.toISOString()

    // Define GraphQL Query for the last 48 hours
    const graphqlQuery = {
      query: `
        {
          viewer {
            zones(filter: {zoneTag: "${id}"}) {
              httpRequests1hGroups(
                limit: 24
                filter: { datetime_geq: "${formattedStartDate}", datetime_lt: "${formattedEndDate}" }
                orderBy: [datetime_ASC]
              ) {
                dateTime: dimensions {
                  datetime
                }
                sum {
                  requests
                  bytes
                }
              }
              pathRequests: httpRequestsAdaptiveGroups(
                  limit: 5
                  filter: { datetime_geq: "${formattedStartDate}", datetime_lt: "${formattedEndDate}" }
                  orderBy: [sum_edgeResponseBytes_DESC]
              ) {
                  dimensions {
                      clientRequestPath
                  }
                  sum {
                      edgeResponseBytes
                  }
              }
            }
          }
        }
      `,
    }

    // Make API request
    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify(graphqlQuery),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`Cloudflare GraphQL API Error: ${JSON.stringify(data, null, 2)}`)
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    // Extract analytics data
    const results = data?.data?.viewer?.zones?.[0]?.httpRequests1hGroups || []
    const pathData = data?.data?.viewer?.zones?.[0]?.pathRequests || []

    // Initialize total requests and bandwidth
    let totalRequests = 0
    let totalBandwidth = 0

    // Group results into 4-hour cycles
    const groupedData = results.reduce((acc: any[], entry: any, index: number) => {
      const requests = entry.sum.requests || 0
      const bandwidth = (entry.sum.bytes || 0) / (1024 * 1024 * 1024) // Convert bytes to GB

      totalRequests += requests
      totalBandwidth += bandwidth

      if (index % 2 === 0) {
        acc.push({
          dateTime: entry.dateTime.datetime,
          requests,
          bandwidth,
        })
      } else {
        const lastIndex = acc.length - 1
        acc[lastIndex].requests += requests
        acc[lastIndex].bandwidth += bandwidth
      }
      return acc
    }, [])

    return {
      groupedData,
      totalRequests,
      totalBandwidth,
      pathData
    }
  } catch (error) {
    console.error(`Error fetching Cloudflare GraphQL stats for zone ${id}:`, error)
    return null
  }
}
