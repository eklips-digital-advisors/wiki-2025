import { Project, User } from '@/payload-types'

export const generateInvertedResources = (users: User[], projects: Project[]) => {
  const resources = projects.flatMap((project) => {
    const projectUsers = users
      .filter((user: any) => user.projects?.some((p: any) => p.id === project.id))
      .map((user: any) => ({
        id: `user-${user.id}-${project.id}`,
        title: user.name || '',
        parentId: `${project.id}`,
        profileImage: user?.media?.url || '',
        position: user?.position || '',
      }))

    // Only return project if it has users
    if (projectUsers.length === 0) {
      return [] // Skip project with no users
    }

    const projectResource = {
      id: `${project.id}`,
      title: project.title || '',
      users: [],
      projectImage: project.image || '',
    }

    return [projectResource, ...projectUsers]
  })

  const staticProjects = [
    {
      id: 'eklips-vacation',
      title: 'Eklips - Vacation',
      users: [],
      projectImage: '',
      type: 'default'
    },
  ]

  return [...resources, ...staticProjects]
}
