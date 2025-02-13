export async function getSingleCloudflareItemStats(id: string | number) {
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
    const past24Hours = new Date()
    past24Hours.setHours(now.getHours() - 24)

    const past48Hours = new Date(past24Hours)
    past48Hours.setHours(past48Hours.getHours() - 24)

    const nowTime = now.toISOString()
    const twentyFourTime = past24Hours.toISOString()
    const fourtyEightTime = past48Hours.toISOString()

    // Define GraphQL Query
    const graphqlQuery = {
      query: `
        {
          viewer {
            zones(filter: {zoneTag: "${id}"}) {
              twentyFour: httpRequests1hGroups(limit: 100, filter: {datetime_geq: "${twentyFourTime}", datetime_lt: "${nowTime}"}) {
                sum {
                  requests
                  bytes
                }
              }
              fourtyEight: httpRequests1hGroups(limit: 100, filter: {datetime_geq: "${fourtyEightTime}", datetime_lt: "${twentyFourTime}"}) {
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
    const resultTwentyFour = data?.data?.viewer?.zones?.[0]?.twentyFour?.[0]?.sum
    const resultFourtyEight = data?.data?.viewer?.zones?.[0]?.fourtyEight?.[0]?.sum
    const percentageBandWidth =
      (((resultTwentyFour?.bytes || 0) - resultFourtyEight?.bytes || 0) /
        (resultFourtyEight?.bytes || 0)) *
      100

    return {
      requests: resultTwentyFour?.requests || 0,
      bandwidth: (resultTwentyFour?.bytes || 0) / (1024 * 1024 * 1024),
      percentageBandWidth: percentageBandWidth,
    }
  } catch (error) {
    console.error(`Error fetching Cloudflare GraphQL stats for zone ${id}:`, error)
    return null
  }
}
