import { getClientSideURL } from '@/utilities/getURL'

export const handleResizeClickInverted = async (
  info: any,
  router: any,
  setStatusTimeEntriesState: any,
  loggedUser: any,
  setToast: any
) => {
  if (!loggedUser) {
    setToast({ message: 'Please log in first', type: 'error' })
    return
  }

  // Normalize for both dateClick and eventClick
  const isEventClick = !!info.event

  if (isEventClick && info.event.getResources?.()?.[0]?._resource.parentId) {
    setToast({ message: 'Update time on users on users view', type: 'error' })
    return
  }

  if (isEventClick && info.event?.extendedProps?.type) {
    setToast({ message: 'Cannot edit teamwork events', type: 'error' })
    return
  }

  const start = isEventClick
    ? info.event.start
    : info.start;

  const end = isEventClick
    ? info.event.end
    : info.end;
  
  const eventId = info.event.id.split('-')[0].trim()

  if (!eventId || !start) return

  try {
    const res = await fetch(`${getClientSideURL()}/api/status-time-entries/${eventId}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const existingEntry = await res.json()

    if (existingEntry && existingEntry.id) {
      // Update the existing entry
      const updateRes = await fetch(
        `${getClientSideURL()}/api/status-time-entries/${existingEntry.id}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start: start,
            end: end,
          }),
        }
      )
      const updated = await updateRes.json()
      const newTimeEntryState = updated?.doc

      if (newTimeEntryState) {
        setStatusTimeEntriesState((prev: any) =>
          prev.map((entry: any) => (entry.id === newTimeEntryState.id ? newTimeEntryState : entry)),
        )
      }
      setToast({ message: 'Status updated', type: 'success' })
      console.log('Updated entry:', updated)
    }

    await fetch('/next/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: '/planning' }), // Pass the path dynamically
    })
    router.refresh()
  } catch (err) {
    setToast({ message: 'Failed to update status', type: 'error' })
    console.error('Error handling status:', err)
  }
}
