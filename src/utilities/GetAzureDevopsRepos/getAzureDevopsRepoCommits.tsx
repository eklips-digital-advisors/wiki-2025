type AzureDevopsCommit = {
  author?: { date?: string }
  committer?: { date?: string }
}

const normalizeBranchName = (branchRef?: string) => {
  if (!branchRef) return undefined
  return branchRef.startsWith('refs/heads/') ? branchRef.replace('refs/heads/', '') : branchRef
}

export default async function getAzureDevopsRepoCommits(
  repoId: string | number,
  defaultBranch?: string,
  projectName?: string,
): Promise<string | null> {
  if (!repoId) return null

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

    const branchName = normalizeBranchName(defaultBranch)
    const projectSegment = projectName ? `/${encodeURIComponent(projectName)}` : ''
    const baseCommitsUrl = `${baseUrl}${projectSegment}/_apis/git/repositories/${repoId}/commits`

    const params = new URLSearchParams({
      'searchCriteria.$top': '1',
      'searchCriteria.showOldestCommits': 'true',
      'api-version': '7.0',
    })

    if (branchName) {
      params.set('searchCriteria.itemVersion.versionType', 'branch')
      params.set('searchCriteria.itemVersion.version', branchName)
    }

    const response = await fetch(`${baseCommitsUrl}?${params.toString()}`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    const commit: AzureDevopsCommit | undefined = data?.value?.[0] || data?.commits?.[0]
    return commit?.committer?.date || commit?.author?.date || null
  } catch (error) {
    console.error(`Error fetching Azure DevOps commits for ${repoId}:`, error)
    return null
  }
}
