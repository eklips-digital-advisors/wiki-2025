export default async function getSingleAzureDevopsItem(repoId: string | number) {
  if (!repoId) return ''

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

    const url = `${baseUrl}/_apis/git/repositories/${repoId}?api-version=7.0`
    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching Azure DevOps repository ${repoId}:`, error)
    return null
  }
}
