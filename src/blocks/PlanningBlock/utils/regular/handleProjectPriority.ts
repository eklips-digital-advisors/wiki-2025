import { ProjectPriority } from '@/collections/Projects/priorityOptions'
import { getClientSideURL } from '@/utilities/getURL'

export const handleProjectPriority = async ({
  resource,
  priority,
  setUsersState,
  setProjectsState: _setProjectsState,
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

  const userId = resource?._resource?.parentId || resource?.extendedProps?.userId

  if (!projectId || !resource || !userId) return

  let nextPriorities: { project: string; priority: ProjectPriority }[] = []

  setUsersState((prev) => {
    const normalizeProjectId = (project: any) =>
      typeof project === 'string' ? project : project?.id

    const user = prev.find((u) => u.id === userId)
    const existingPriorities = Array.isArray(user?.projectPriorities)
      ? user.projectPriorities
      : []

    nextPriorities = [
      ...existingPriorities
        .filter((entry: any) => normalizeProjectId(entry?.project) !== projectId)
        .map((entry: any) => ({
          ...entry,
          project: normalizeProjectId(entry?.project),
        })),
      {
        project: projectId,
        priority,
      },
    ]

    return prev.map((u) =>
      u.id === userId
        ? {
            ...u,
            projectPriorities: nextPriorities,
          }
        : u
    )
  })

  try {
    const req = await fetch(`${getClientSideURL()}/api/users/${userId}?depth=2`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectPriorities: nextPriorities,
      }),
    })

    const data = await req.json()
    const updatedUser = data?.doc

    if (updatedUser) {
      setUsersState((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      )
      setToast({ message: 'Priority updated', type: 'success' })
    }
  } catch (err) {
    console.log(err)
    setToast({ message: 'Could not update priority', type: 'error' })
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
