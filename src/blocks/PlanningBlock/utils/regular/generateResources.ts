import { User } from '@/payload-types'
import { ProjectPriority } from '@/collections/Projects/priorityOptions'

type UserWithProjectPriorities = User & {
  projectPriorities?: {
    id?: string | null
    project?: string | { id?: string | null } | null | import('@/payload-types').Project
    priority?: ProjectPriority | null
  }[] | null
}

const priorityRank: Record<ProjectPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
}

const getUserProjectPriority = (
  user: UserWithProjectPriorities,
  projectId: string
): ProjectPriority | undefined => {
  if (!projectId) return undefined

  return user.projectPriorities?.find((entry) => {
    const entryProject = entry?.project
    const entryProjectId = typeof entryProject === 'string' ? entryProject : entryProject?.id
    return entryProjectId === projectId
  })?.priority as ProjectPriority | undefined
}

export const generateResources = (users: UserWithProjectPriorities[]) => {
  const resolveMediaUrl = (media: unknown) => {
    if (!media || typeof media !== 'object') return ''
    return ((media as { url?: string | null }).url || '') as string
  }

  const usersById = new Map(users.map((user) => [user.id, user]))

  const resolveAssignee = (value: unknown) => {
    if (!value) {
      return {
        id: null,
        name: '',
        avatarUrl: '',
      }
    }

    if (typeof value === 'string') {
      const matchedUser = usersById.get(value)
      return {
        id: value,
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
      const relationId = relation.id || null
      const matchedUser = relationId ? usersById.get(relationId) : null
      return {
        id: relationId,
        name: relation.name || matchedUser?.name || '',
        avatarUrl: resolveMediaUrl(relation.media) || resolveMediaUrl(matchedUser?.media),
      }
    }

    return {
      id: null,
      name: '',
      avatarUrl: '',
    }
  }

  return users.flatMap((user) => {
    const profileImage =
      user?.media && typeof user.media === 'object'
        ? (user.media as { url?: string | null })?.url || ''
        : ''

    const resolvePriority = (project: any): ProjectPriority => {
      const projectId = typeof project === 'string' ? project : project?.id
      const userPriority = projectId ? getUserProjectPriority(user, projectId) : undefined
      const projectPriority =
        project && typeof project === 'object'
          ? (project.priority as ProjectPriority | undefined)
          : undefined

      return userPriority || projectPriority || 'none'
    }

    const userResource = {
      id: `${user.id}`,
      title: user.name || '',
      projects: user.projects || [],
      profileImage,
      position: user?.position || '',
    }

    const userProjects = Array.isArray(user?.projects)
      ? [...user.projects]
        .sort((a: any, b: any) => {
          const aPriority = priorityRank[resolvePriority(a)] ?? 0
          const bPriority = priorityRank[resolvePriority(b)] ?? 0

          if (bPriority !== aPriority) {
            return bPriority - aPriority
          }

          return (a?.title || '').localeCompare(b?.title || '')
        })
        .map((project: any) => {
          const pmData = resolveAssignee(project?.pm)
          const frontendData = resolveAssignee(project?.frontend)
          const backendData = resolveAssignee(project?.backend)

          return {
            id: `project-${project.id}-${user.id}`,
            title: project?.title || '',
            parentId: `${user.id}`,
            projectId: project.id,
            projects: user.projects || [],
            projectImage: project.image || '',
            projectType: project.type || '',
            comment: project.comment || '',
            priority: resolvePriority(project),
            userId: user.id,
            isProject: true,
            showInProjectView: project.showInProjectView,
            pmId: pmData.id,
            pmName: pmData.name,
            pmAvatarUrl: pmData.avatarUrl,
            frontendId: frontendData.id,
            frontendName: frontendData.name,
            frontendAvatarUrl: frontendData.avatarUrl,
            backendId: backendData.id,
            backendName: backendData.name,
            backendAvatarUrl: backendData.avatarUrl,
          }
        })
      : []

    return [userResource, ...userProjects]
  })
}
