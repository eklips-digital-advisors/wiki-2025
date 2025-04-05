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
  projectsState
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
}) => {
  if (!loggedUser) {
    setToast({ message: 'Please log in first', type: 'error' })
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
    const req = await fetch(`${getClientSideURL()}/api/projects/${selectedProjectId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        showInProjectView: true,
      }),
    })
    const data = await req.json()
    const newProjectState = data?.doc
    console.log('added', data?.doc)
    setToast({ message: `Project added`, type: 'success' })
    if (data?.doc) {
      setProjectsState((prev) =>
        prev.map((project) => (project.id === newProjectState.id ? newProjectState : project)),
      )
    }
    setToast({ message: 'Project added', type: 'success' })
  } catch (err) {
    console.log(err)
  }

  setSelectedProjectId(null) // Reset selection
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
