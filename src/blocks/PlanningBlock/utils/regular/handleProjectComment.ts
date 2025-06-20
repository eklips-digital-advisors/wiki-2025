import { getClientSideURL } from '@/utilities/getURL'

export const handleProjectComment = async (
  resource: any,
  setUsersState: React.Dispatch<React.SetStateAction<any[]>>,
  router: any,
  setToast: (toast: any) => void,
  loggedUser: any,
  projectComment: string,
  toggleModal: (slug: string) => void,
  setProjectsState: React.Dispatch<React.SetStateAction<any[]>>
) => {
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
        comment: projectComment || '',
      }),
    })

    const data = await req.json()
    console.log('comment updated', data?.doc)
    setToast({ message: `Comment updated`, type: 'success' })

    if (data?.doc) {
      const updated = data.doc;

      setProjectsState(prev =>
        prev.map(p => (p.id === updated.id ? updated : p)),
      );

      setUsersState(prev =>
        prev.map(u =>
          !u.projects
            ? u
            : { ...u,
                projects: u.projects.map((p: any) =>
                  p.id === updated.id ? updated : p
                ) }
        ),
      );

      setToast({ message: 'Comment updated', type: 'success' });
    }

  } catch (err) {
    console.log(err)
  }

  toggleModal('project-comment-modal') // Close modal

  await fetch('/next/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: '/planning' }), // Pass the path dynamically
  })
  router.refresh()
}
