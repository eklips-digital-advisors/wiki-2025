import { User } from '@/payload-types'

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
      ? user.projects.map((project: any) => ({
          id: `project-${project.id}-${user.id}`,
          title: project?.title || '',
          parentId: `${user.id}`,
          projectId: project.id,
          projects: user.projects || [],
          projectImage: project.image || '',
          projectType: project.type || '',
          comment: project.comment || '',
          isProject: true,
          showInProjectView: project.showInProjectView,
        }))
      : []

    return [userResource, ...userProjects]
  })
}
