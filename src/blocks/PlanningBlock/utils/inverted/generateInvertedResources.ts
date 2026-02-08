import { Project, User } from '@/payload-types'

export const generateInvertedResources = (
  users: User[],
  projects: Project[],
  statusTimeEntries: any[],
  sortDirection: 'asc' | 'desc',
  invertedShowAllProjects: boolean
) => {
  const resolveMediaUrl = (media: unknown) => {
    if (!media || typeof media !== 'object') return ''
    return ((media as { url?: string | null }).url || '') as string
  }

  const resolveUserData = (value: unknown) => {
    const fallback = {
      id: '',
      name: '',
      avatarUrl: '',
    }

    if (!value) return fallback
    if (typeof value === 'string') {
      const matchedUser = users.find((user) => user.id === value)
      return {
        id: matchedUser?.id || '',
        name: matchedUser?.name || '',
        avatarUrl: resolveMediaUrl(matchedUser?.media),
      }
    }

    if (typeof value === 'object') {
      const relation = value as {
        id?: string | null
        name?: string | null
        media?: unknown
      }
      const relationId = relation.id || ''
      const matchedUser = relationId ? users.find((user) => user.id === relationId) : null

      return {
        id: relationId || matchedUser?.id || '',
        name: relation.name || matchedUser?.name || '',
        avatarUrl: resolveMediaUrl(relation.media) || resolveMediaUrl(matchedUser?.media),
      }
    }

    return fallback
  }

  const projectsWithLaunchDate = projects
    .filter((project) => invertedShowAllProjects || project.showInProjectView)
    .map((project) => {
      const launchStatus = statusTimeEntries.find(
        (entry) => entry.project.id === project.id && entry.status === 'launch'
      )

      return {
        ...project,
        launchDate: launchStatus ? new Date(launchStatus?.end).getTime() : Infinity,
      }
    })
    .sort((a, b) => {
      return sortDirection === 'asc'
        ? a.launchDate - b.launchDate
        : b.launchDate - a.launchDate
    })

  const resources = projectsWithLaunchDate.flatMap((project) => {
      const pmData = resolveUserData((project as any)?.pm)
      const frontendData = resolveUserData((project as any)?.frontend)
      const backendData = resolveUserData((project as any)?.backend)

      const projectResource = {
        id: `${project.id}`,
        title: project.title || '',
        projectId: project.id,
        projectTeamwork: project?.projectTeamwork || '',
        projectImage: project.image || '',
        isProject: true,
        type: project?.projectTeamwork ? '' : 'non-teamwork-project',
        comment: project.comment || '',
        priority: project.priority || 'none',
        pmId: pmData.id || null,
        pmName: pmData.name || '',
        pmAvatarUrl: pmData.avatarUrl || '',
        frontendId: frontendData.id || null,
        frontendName: frontendData.name || '',
        frontendAvatarUrl: frontendData.avatarUrl || '',
        backendId: backendData.id || null,
        backendName: backendData.name || '',
        backendAvatarUrl: backendData.avatarUrl || '',
        showInProjectView: project.showInProjectView,
      }

      const userResources = Array.isArray(users)
        ? users
          .filter((user: any) => user.projects?.some((p: any) => p.id === project.id))
          .map((user: any) => ({
            id: `user-${user.id}-${project.id}`,
            title: user.name || '',
            parentId: project.id,
            userId: user.id,
            profileImage: user?.media?.url || '',
            position: user?.position || '',
            isProject: false,
            projectId: project.id,
            projectType: project?.type,
          }))
        : []

      return [projectResource, ...userResources]
    })

  const staticProjects = [
    {
      id: 'eklips-vacation',
      title: 'Eklips - Vacation',
      users: [],
      projectImage: '',
      type: 'default',
    },
  ]

  return [...resources, ...staticProjects]
}
