import { getCwaasZoneId } from '@/utilities/GetCloudflareItems/getCwaasZone'

export async function getSingleCloudflareItem(hostname: string) {
  if (!hostname) return ''

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
      ContentType: 'application/json',
    }

    const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames?hostname=${encodeURIComponent(hostname)}`

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json()
    return data?.result?.[0] || null
  } catch (error) {
    console.error(`Error fetching Cloudflare hostname ${hostname}:`, error)
    return null; // Return `null` to indicate failure
  }
}
