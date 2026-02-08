import { getClientSideURL } from '@/utilities/getURL'

export const handleAddProject = async ({
  selectedProjectId,
  selectedResource,
  setSelectedProjectId,
  setSelectedResource,
  toggleModal,
  setUsersState,
  router,
  modalSlug,
  setToast,
  loggedUser
}: {
  selectedProjectId: string | null
  selectedResource: any
  setSelectedProjectId: React.Dispatch<React.SetStateAction<string | null>>
  setSelectedResource: React.Dispatch<React.SetStateAction<any | null>>
  toggleModal: (slug: string) => void
  setUsersState: React.Dispatch<React.SetStateAction<any[]>>
  router: any
  modalSlug: string
  setToast: (toast: any) => void
  loggedUser: any
}) => {
  if (!selectedProjectId || !selectedResource) return

  const existingProjects = selectedResource?.extendedProps?.projects || []
  const projectExists = existingProjects.some((project: any) => project.id === selectedProjectId)

  if (loggedUser?.id !== selectedResource.id && loggedUser.role !== 'admin' && loggedUser.role !== 'editor') {
    setToast({
      message: 'You can only update your own projects unless you are an admin or editor.',
      type: 'error',
    })
    return
  }

  if (projectExists) {
    console.log(
      `Project ${selectedProjectId} already exists for user ${selectedResource.id}. Canceling add.`,
    )
    setToast({ message: 'This project is already assigned to this user.', type: 'error' })
    // toggleModal(modalSlug)
    return
  }

  const updatedProjects = [...existingProjects, { id: selectedProjectId }]

  try {
    const req = await fetch(`${getClientSideURL()}/api/users/${selectedResource.id}`, {
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
    const newUserState = data?.doc
    console.log('added', data?.doc)
    setToast({
      message: `Project added to ${selectedResource?.title || 'the selected user'}.`,
      type: 'success',
    })
    if (data?.doc) {
      setUsersState((prev) =>
        prev.map((user) => (user.id === newUserState.id ? newUserState : user)),
      )
    }
  } catch (err) {
    console.log(err)
    setToast({ message: 'Unable to add project for this user.', type: 'error' })
  }

  setSelectedProjectId(null) // Reset selection
  setSelectedResource(null) // Reset resource
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
