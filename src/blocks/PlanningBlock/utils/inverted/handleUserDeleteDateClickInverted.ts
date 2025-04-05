import { getClientSideURL } from '@/utilities/getURL'

export const handleUserDeleteDateClickInverted = async (
  info: any,
  router: any,
  setTimeEntriesState: any,
  setToast: any
) => {
  // Normalize for both dateClick and eventClick
  const isEventClick = !!info.event
  const eventId = info?.event?.id?.split?.('-')?.[0]?.trim()

  if (!eventId || !isEventClick) {
    setToast({ message: 'Entry not deleted, no event id, does event exist?', type: 'error' })
    return
  }

  try {
    const res = await fetch(`${getClientSideURL()}/api/time-entries/${eventId}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const existingEntry = await res.json()

    if (!existingEntry?.id) return

    await fetch(`${getClientSideURL()}/api/time-entries/${existingEntry.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    setTimeEntriesState((prev: any) => prev.filter((entry: any) => entry.id !== existingEntry.id))

    setToast({ message: 'Entry deleted', type: 'success' })

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
  }
}
