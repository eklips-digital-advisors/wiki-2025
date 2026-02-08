import { getClientSideURL } from '@/utilities/getURL'

export const handleProjectDeleteDateClickInverted = async (
  info: any,
  router: any,
  setStatusTimeEntriesState: any,
  setToast: any
) => {
  // Normalize for both dateClick and eventClick
  const isEventClick = !!info.event
  const eventId = info?.event?.id

  if (!isEventClick || !eventId) {
    setToast({ message: 'Unable to delete status entry: missing entry ID.', type: 'error' })
    return
  }

  try {
    const res = await fetch(`${getClientSideURL()}/api/status-time-entries/${eventId}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const existingEntry = await res.json()

    if (!existingEntry?.id) return

    await fetch(`${getClientSideURL()}/api/status-time-entries/${existingEntry.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    setStatusTimeEntriesState((prev: any) => prev.filter((entry: any) => entry.id !== existingEntry.id))

    setToast({ message: 'Status entry deleted successfully.', type: 'success' })

    await fetch('/next/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: '/planning' }), // Pass the path dynamically
    })
    router.refresh()
  } catch (err) {
    console.error('Error handling time entry:', err)
    setToast({ message: 'Unable to delete status entry.', type: 'error' })
  }
}
