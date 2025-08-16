import { Project, User } from '@/payload-types'

export const generateInvertedResources = (
  users: User[],
  projects: Project[],
  statusTimeEntries: any[],
  sortDirection: 'asc' | 'desc'
) => {
  const projectsWithLaunchDate = projects
    .filter((project) => project.showInProjectView)
    .map((project) => {
      const launchStatus = statusTimeEntries.find(
        (entry) => entry.project.id === project.id && entry.status === 'launch'
      )

      return {
        ...project,
        launchDate: launchStatus ? new Date(launchStatus.start).getTime() : Infinity,
      }
    })
    .sort((a, b) => {
      return sortDirection === 'asc'
        ? a.launchDate - b.launchDate
        : b.launchDate - a.launchDate
    })

  const resources = projectsWithLaunchDate.flatMap((project) => {
      const projectResource = {
        id: `${project.id}`,
        title: project.title || '',
        projectId: project.id,
        projectImage: project.image || '',
        isProject: true,
        type: project?.projectTeamwork ? '' : 'non-teamwork-project',
        comment: project.comment || '',
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
