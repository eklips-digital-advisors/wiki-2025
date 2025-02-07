export async function getSingleCloudflareItemStats(id: string | number) {
  if (!id) return null;

  try {
    if (!process.env.CLOUDFLARE_EKLIPS) {
      throw new Error('CLOUDFLARE_EKLIPS is not set in environment variables.');
    }

    const headers = {
      Authorization: `Bearer ${process.env.CLOUDFLARE_EKLIPS}`,
      'Content-Type': 'application/json',
    };

    const past24Hours = new Date();
    const now = new Date();
    past24Hours.setHours(past24Hours.getHours() - 24);

    const formattedStartTime = past24Hours.toISOString();
    const formattedEndTime = now.toISOString();

    // Define GraphQL Query
    const graphqlQuery = {
      query: `
        {
          viewer {
            zones(filter: {zoneTag: "${id}"}) {
              httpRequests1hGroups(limit: 100, filter: {datetime_geq: "${formattedStartTime}", datetime_lt: "${formattedEndTime}"}) {
                sum {
                  requests
                  bytes
                }
              }
            }
          }
        }
      `
    };

    // Make API request
    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify(graphqlQuery),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Cloudflare GraphQL API Error: ${JSON.stringify(data, null, 2)}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Extract analytics data
    const result = data?.data?.viewer?.zones?.[0]?.httpRequests1hGroups?.[0]?.sum;

    return {
      requests: result?.requests || 0,
      bandwidth: (result?.bytes || 0) / (1024 * 1024 * 1024), // Convert bytes to GB
    };
  } catch (error) {
    console.error(`Error fetching Cloudflare GraphQL stats for zone ${id}:`, error);
    return null;
  }
}
