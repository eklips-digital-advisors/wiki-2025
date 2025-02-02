import React from 'react'
import { Dropdown } from '@/components/Dropdown'

export const GetAllCloudflareItems: React.FC = async () => {
  try {
    if (!process.env.CLOUDFLARE_EKLIPS) {
      throw new Error('CLOUDFLARE_EKLIPS is not set in environment variables.')
    }

    const headers = {
      Authorization: `Bearer ${process.env.CLOUDFLARE_EKLIPS}`,
      ContentType: 'application/json',
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones?per_page=200`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()

    const fetchedOptions =
      data?.result?.map((item: { name: string; id: string }) => ({
        label: item?.name,
        value: item?.id,
      })) || []

    return <Dropdown label="Cloudflare" path="integrations.cloudflare" fetchedOptions={fetchedOptions} />
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return <p>Failed to load repositories.</p>
  }
}
