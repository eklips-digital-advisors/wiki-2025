import { ProjectPriority } from '@/collections/Projects/priorityOptions'
import { getClientSideURL } from '@/utilities/getURL'

export const handleProjectPriority = async ({
  resource,
  priority,
  setUsersState,
  setProjectsState,
  router,
  setToast,
  loggedUser,
}: {
  resource: any
  priority: ProjectPriority
  setUsersState: React.Dispatch<React.SetStateAction<any[]>>
  setProjectsState: React.Dispatch<React.SetStateAction<any[]>>
  router: any
  setToast: (toast: any) => void
  loggedUser: any
}) => {
  if (!loggedUser) {
    setToast({ message: 'Please log in', type: 'error' })
    return
  }

  const projectId = resource?.extendedProps?.projectId

  if (!projectId || !resource) return

  try {
    const req = await fetch(`${getClientSideURL()}/api/projects/${projectId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priority,
      }),
    })

    const data = await req.json()
    const updated = data?.doc

    if (updated) {
      setProjectsState((prev) => prev.map((project) => (project.id === updated.id ? updated : project)))
      setUsersState((prev) =>
        prev.map((user) =>
          !user.projects
            ? user
            : {
                ...user,
                projects: user.projects.map((project: any) =>
                  project.id === updated.id ? updated : project
                ),
              }
        )
      )
      setToast({ message: 'Priority updated', type: 'success' })
    }
  } catch (err) {
    console.log(err)
  }

  await fetch('/next/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: '/planning' }),
  })
  router.refresh()
}
