type CloudflareZone = {
  id: string
  name: string
  owner?: { id?: string }
  plan?: { name?: string }
}

let cachedZone: CloudflareZone | null = null
let cachedZoneLoaded = false

export const getCwaasZone = async (): Promise<CloudflareZone | null> => {
  if (cachedZoneLoaded) return cachedZone

  if (!process.env.CLOUDFLARE_EKLIPS) {
    throw new Error('CLOUDFLARE_EKLIPS is not set in environment variables.')
  }

  const headers = {
    Authorization: `Bearer ${process.env.CLOUDFLARE_EKLIPS}`,
    'Content-Type': 'application/json',
  }

  const response = await fetch(
    'https://api.cloudflare.com/client/v4/zones?name=cwaas.site&status=active&per_page=1',
    { headers },
  )

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  const data = await response.json()
  cachedZone = data?.result?.[0] || null
  cachedZoneLoaded = true
  return cachedZone
}

export const getCwaasZoneId = async (): Promise<string | null> => {
  const zone = await getCwaasZone()
  return zone?.id || null
}
