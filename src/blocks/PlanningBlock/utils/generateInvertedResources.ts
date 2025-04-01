import { Project, User } from '@/payload-types'

export const generateInvertedResources = (users: User[], projects: Project[]) => {
  console.log('users', users)
  console.log('projects', projects)

  const resources = projects
    .filter((project) => project.showInProjectView)
    .flatMap((project) => {
      const projectResource = {
        id: `${project.id}`,
        title: project.title || '',
        projectId: project.id,
        projectImage: project.image || '',
        isProject: true,
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
