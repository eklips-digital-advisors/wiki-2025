import { User } from '@/payload-types'
import { ProjectPriority } from '@/collections/Projects/priorityOptions'

const priorityRank: Record<ProjectPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
}

export const generateResources = (users: User[]) => {
  return users.flatMap((user: any) => {
    const userResource = {
      id: `${user.id}`,
      title: user.name || '',
      projects: user.projects || [],
      profileImage: user?.media?.url || '',
      position: user?.position || '',
    }

    const userProjects = Array.isArray(user?.projects)
      ? [...user.projects]
        .sort((a: any, b: any) => {
          const aPriority = priorityRank[(a?.priority as ProjectPriority) || 'none'] ?? 0
          const bPriority = priorityRank[(b?.priority as ProjectPriority) || 'none'] ?? 0

          if (bPriority !== aPriority) {
            return bPriority - aPriority
          }

          return (a?.title || '').localeCompare(b?.title || '')
        })
        .map((project: any) => ({
          id: `project-${project.id}-${user.id}`,
          title: project?.title || '',
          parentId: `${user.id}`,
          projectId: project.id,
          projects: user.projects || [],
          projectImage: project.image || '',
          projectType: project.type || '',
          comment: project.comment || '',
          priority: project.priority || 'none',
          isProject: true,
          showInProjectView: project.showInProjectView,
        }))
      : []

    return [userResource, ...userProjects]
  })
}
