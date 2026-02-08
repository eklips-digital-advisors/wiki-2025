import { getClientSideURL } from '@/utilities/getURL'

export const handleRemoveProjectInverted = async (
  resource: any,
  setProjectsState: React.Dispatch<React.SetStateAction<any[]>>,
  router: any,
  setToast: (toast: any) => void,
  loggedUser: any
) => {
  if (!loggedUser) {
    setToast({ message: 'Please sign in to continue.', type: 'error' })
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
        showInProjectView: false,
      }),
    })
    const data = await req.json()
    console.log('removed', data)
    const newProjectState = data?.doc
    if (data?.doc) {
      setProjectsState((prev) =>
        prev.map((project) => (project.id === newProjectState.id ? newProjectState : project)),
      )
    }
    setToast({ message: 'Project removed from project view.', type: 'success' })
  } catch (err) {
    console.log(err)
    setToast({ message: 'Unable to remove project from project view.', type: 'error' })
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
