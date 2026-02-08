import { getClientSideURL } from '@/utilities/getURL'

export const handleProjectComment = async (
  resource: any,
  setUsersState: React.Dispatch<React.SetStateAction<any[]>>,
  _router: any,
  setToast: (toast: any) => void,
  loggedUser: any,
  projectComment: string,
  toggleModal: (slug: string) => void,
  setProjectsState: React.Dispatch<React.SetStateAction<any[]>>,
  pm: string | null,
  frontend: string | null,
  backend: string | null,
) => {
  if (!loggedUser) {
    setToast({ message: 'Please sign in to continue.', type: 'error' })
    return
  }

  const projectId =
    resource?.extendedProps?.projectId ||
    resource?._resource?.extendedProps?.projectId ||
    resource?._resource?.id

  if (!projectId || !resource) return

  try {
    const req = await fetch(`${getClientSideURL()}/api/projects/${projectId}?depth=2`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: projectComment || '',
        pm: pm || null,
        frontend: frontend || null,
        backend: backend || null,
      }),
    })

    if (!req.ok) {
      throw new Error(`Failed to update comment: ${req.status}`)
    }

    const data = await req.json()

    if (data?.doc) {
      const updated = data.doc

      setProjectsState(prev =>
        prev.map(p => (p.id === updated.id ? updated : p)),
      )

      setUsersState(prev =>
        prev.map(u =>
          !u.projects
            ? u
            : { ...u,
                projects: u.projects.map((p: any) =>
                  p.id === updated.id ? updated : p
                ) }
        ),
      )

      setToast({ message: 'Project details saved successfully.', type: 'success' })
    } else {
      setToast({ message: 'Unable to save project details.', type: 'error' })
    }
  } catch (err) {
    console.log(err)
    setToast({ message: 'Unable to save project details.', type: 'error' })
  }

  toggleModal('project-comment-modal') // Close modal
}
