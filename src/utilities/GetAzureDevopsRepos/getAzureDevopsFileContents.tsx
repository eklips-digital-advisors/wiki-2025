type AzureDevopsItemResponse = {
  content?: string
}

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`)

export default async function getAzureDevopsFileContents(
  repoIdOrName: string | number,
  path: string,
  projectName?: string,
): Promise<string | null> {
  if (!repoIdOrName || !path) return null

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

    const projectSegment = projectName ? `/${encodeURIComponent(projectName)}` : ''
    const params = new URLSearchParams({
      path: normalizePath(path),
      includeContent: 'true',
      'api-version': '7.0',
    })

    const url = `${baseUrl}${projectSegment}/_apis/git/repositories/${repoIdOrName}/items?${params.toString()}`
    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''
    const raw = await response.text()

    if (contentType.includes('application/json')) {
      const data: AzureDevopsItemResponse = JSON.parse(raw)
      return data?.content || null
    }

    // When includeContent=true, Azure DevOps may still return raw file content for text files.
    const trimmed = raw.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const data: AzureDevopsItemResponse = JSON.parse(trimmed)
      return data?.content || null
    }

    return raw || null
  } catch (error) {
    console.error(`Error fetching Azure DevOps file ${path} from ${repoIdOrName}:`, error)
    return null
  }
}
