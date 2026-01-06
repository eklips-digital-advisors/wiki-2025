import React from 'react'
import { Dropdown } from '@/components/Dropdown'
import { getCwaasZone } from '@/utilities/GetCloudflareItems/getCwaasZone'

export const GetAllCloudflareItems: React.FC = async () => {
  try {
    if (!process.env.CLOUDFLARE_EKLIPS) {
      throw new Error('CLOUDFLARE_EKLIPS is not set in environment variables.')
    }

    const headers = {
      Authorization: `Bearer ${process.env.CLOUDFLARE_EKLIPS}`,
      ContentType: 'application/json',
    }

    const zone = await getCwaasZone()

    if (!zone?.id) {
      throw new Error('Could not resolve cwaas.site zone.')
    }

    let page = 1
    let hostnames: { hostname: string }[] = []

    while (true) {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zone.id}/custom_hostnames?page=${page}&per_page=100`,
        { headers },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      hostnames = hostnames.concat(data?.result || [])

      if (data?.result_info?.page >= data?.result_info?.total_pages) {
        break
      }

      page += 1
    }

    const fetchedOptions =
      hostnames?.map((item) => ({
        label: item?.hostname,
        value: item?.hostname,
      })) || []

    return <Dropdown label="Cloudflare" path="integrations.cloudflare" fetchedOptions={fetchedOptions} />
  } catch (error) {
    console.error('Error fetching Cloudflare custom hostnames:', error)
    return <p>Failed to load Cloudflare hostnames.</p>
  }
}
