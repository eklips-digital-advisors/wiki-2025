import { getClientSideURL } from '@/utilities/getURL'

export const handleRemoveProject = async (
  resource: any,
  setUsersState: React.Dispatch<React.SetStateAction<any[]>>,
  router: any,
  setToast: (toast: any) => void,
  loggedUser: any
) => {
  if (!loggedUser) {
    setToast({ message: 'Please log in first', type: 'error' })
    return
  }

  const user = resource?._resource?.parentId
  const projectId = resource?.extendedProps?.projectId

  if (!user || !projectId || !resource) return

  const existingProjects = resource?.extendedProps?.projects || []
  const projectExists = existingProjects.some((project: any) => project.id === projectId)

  if (!projectExists) {
    console.log(`Project ${projectId} does not exist for ${user}. Canceling remove.`)
    return
  }

  const updatedProjects = existingProjects.filter((project: any) => project.id !== projectId)
  console.log(`Removing project ${projectId} for user ${user}`)

  try {
    const req = await fetch(`${getClientSideURL()}/api/users/${user}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projects: updatedProjects,
      }),
    })
    const data = await req.json()
    console.log('removed', data)
    const newUserState = data?.doc
    if (data?.doc) {
      setUsersState((prev) =>
        prev.map((user) => (user.id === newUserState.id ? newUserState : user)),
      )
    }
  } catch (err) {
    console.log(err)
  }

  await fetch('/next/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: '/planning' }), // Pass the path dynamically
  })
  router.refresh()
}
