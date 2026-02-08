import { getClientSideURL } from '@/utilities/getURL'

export const handleAddProjectInverted = async ({
  selectedProjectId,
  setSelectedProjectId,
  toggleModal,
  setProjectsState,
  router,
  modalSlug,
  setToast,
  loggedUser,
  projectsState,
  comment,
  pm,
  frontend,
  backend,
  setComment,
  setPm,
  setFrontend,
  setBackend,
}: {
  selectedProjectId: string | null
  setSelectedProjectId: React.Dispatch<React.SetStateAction<string | null>>
  toggleModal: (slug: string) => void
  setProjectsState: React.Dispatch<React.SetStateAction<any[]>>
  router: any
  modalSlug: string
  setToast: (toast: any) => void
  loggedUser: any
  projectsState: any
  comment: string
  pm: string | null
  frontend: string | null
  backend: string | null
  setComment: React.Dispatch<React.SetStateAction<string>>
  setPm: React.Dispatch<React.SetStateAction<string | null>>
  setFrontend: React.Dispatch<React.SetStateAction<string | null>>
  setBackend: React.Dispatch<React.SetStateAction<string | null>>
}) => {
  if (!loggedUser) {
    setToast({ message: 'Please log in', type: 'error' })
    return
  }

  const alreadyExists = projectsState.some(
    (project: any) => project.id === selectedProjectId && project.showInProjectView
  )

  if (alreadyExists) {
    setToast({ message: 'Project is already in project view', type: 'error' })
    return
  }

  if (!selectedProjectId) return

  try {
    const req = await fetch(`${getClientSideURL()}/api/projects/${selectedProjectId}?depth=2`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        showInProjectView: true,
        comment: comment || '',
        pm: pm || null,
        frontend: frontend || null,
        backend: backend || null,
      }),
    })
    const data = await req.json()
    const newProjectState = data?.doc
    console.log('added', data?.doc)

    if (data?.doc) {
      setProjectsState((prev) =>
        prev.map((project) => (project.id === newProjectState.id ? newProjectState : project)),
      )
      setToast({ message: 'Project added', type: 'success' })
    } else {
      setToast({ message: 'Could not add project', type: 'error' })
    }
  } catch (err) {
    console.log(err)
    setToast({ message: 'Could not add project', type: 'error' })
  }

  setSelectedProjectId(null) // Reset selection
  setComment('')
  setPm(null)
  setFrontend(null)
  setBackend(null)
  toggleModal(modalSlug) // Close modal

  await fetch('/next/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: '/planning' }), // Pass the path dynamically
  })
  router.refresh()
}
