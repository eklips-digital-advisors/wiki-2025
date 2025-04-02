export async function getCumulativeZoneCountFrom2021() {
  if (!process.env.CLOUDFLARE_EKLIPS) {
    throw new Error('CLOUDFLARE_EKLIPS is not set in environment variables.')
  }

  const headers = {
    Authorization: `Bearer ${process.env.CLOUDFLARE_EKLIPS}`,
    'Content-Type': 'application/json',
  }

  let page = 1
  let allZones: any[] = []

  while (true) {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones?page=${page}&per_page=50`, { headers })
    const json = await res.json()

    if (!json.success) throw new Error(`Failed to fetch zones: ${JSON.stringify(json.errors)}`)

    allZones = allZones.concat(json.result)

    if (json.result_info.page >= json.result_info.total_pages) break
    page++
  }

  // Count raw per year
  const zoneCountByYear: Record<string, number> = {}
  for (const zone of allZones) {
    const year = new Date(zone.created_on).getFullYear()
    if (year >= 2021) {
      zoneCountByYear[year] = (zoneCountByYear[year] || 0) + 1
    }
  }

  // Generate cumulative results from 2021 to current year
  const currentYear = new Date().getFullYear()
  const result = []
  let cumulative = 0

  for (let year = 2021; year <= currentYear; year++) {
    const countThisYear = zoneCountByYear[year] || 0
    cumulative += countThisYear
    result.push({ year: year.toString(), count: cumulative })
  }

  return result
}
