import { Project, User } from '@/payload-types'

export const generateInvertedResources = (users: User[], projects: Project[]) => {
  return projects.flatMap((project) => {
    const projectUsers = users
      .filter((user: any) => user.projects?.some((p: any) => p.id === project.id))
      .map((user: any) => ({
        id: `user-${user.id}-project-${project.id}`,
        title: user.name || '',
        parentId: `project-${project.id}`,
        profileImage: user?.media?.url || '',
        position: user?.position || '',
      }))

    // Only return project if it has users
    if (projectUsers.length === 0) {
      return [] // Skip project with no users
    }

    const projectResource = {
      id: `project-${project.id}`,
      title: project.title || '',
      users: [],
      projectImage: project.image || '',
    }

    return [projectResource, ...projectUsers]
  })
}
