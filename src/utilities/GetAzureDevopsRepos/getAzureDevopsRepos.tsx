import React from 'react'
import { Dropdown } from '@/components/Dropdown'

type AzureDevopsRepo = {
  id: string
  name: string
  project?: {
    name?: string
  }
}

export const GetAzureDevopsRepos: React.FC = async () => {
  try {
    const baseUrl = (process.env.AZURE_DEVOPS_URL || 'https://dev.azure.com/eklipsdigital').replace(
      /\/$/,
      '',
    )
    const pat = process.env.AZURE_DEVOPS_PAT

    if (!pat) {
      throw new Error('AZURE_DEVOPS_PAT is not set in environment variables.')
    }

    const auth = Buffer.from(`:${pat}`).toString('base64')
    const headers = {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(`${baseUrl}/_apis/git/repositories?api-version=7.0`, { headers })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()

    const fetchedOptions =
      data?.value?.map((item: AzureDevopsRepo) => ({
        label: item?.project?.name ? `${item.project.name}/${item.name}` : item.name,
        value: item.id || item.name,
      })) || []

    return (
      <Dropdown label="Azure DevOps" path="integrations.azureDevops" fetchedOptions={fetchedOptions} />
    )
  } catch (error) {
    console.error('Error fetching Azure DevOps repositories:', error)
    return <p>Failed to load Azure DevOps repositories.</p>
  }
}
