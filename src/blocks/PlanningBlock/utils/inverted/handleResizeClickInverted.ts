import { getClientSideURL } from '@/utilities/getURL'

export const handleResizeClickInverted = async (
  info: any,
  router: any,
  setStatusTimeEntriesState: any,
  loggedUser: any,
  setToast: any,
  setTimeEntriesState: any
) => {
  const isEventClick = !!info.event
  const isChild = !!info.event.getResources?.()?.[0]?._resource.parentId

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
  
  const eventId = info?.event?.id?.split?.('-')?.[0]?.trim()

  if (!eventId || !start) return

  const endpoint = isChild ? `time-entries` : `status-time-entries`

  try {
    const res = await fetch(`${getClientSideURL()}/api/${endpoint}/${eventId}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const existingEntry = await res.json()

    if (existingEntry && existingEntry.id) {
      // Update the existing entry
      const updateRes = await fetch(
        `${getClientSideURL()}/api/${endpoint}/${existingEntry.id}`,
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

      if (newTimeEntryState && !isChild) {
        setStatusTimeEntriesState((prev: any) =>
          prev.map((entry: any) => (entry.id === newTimeEntryState.id ? newTimeEntryState : entry)),
        )
      }
      if (newTimeEntryState && isChild) {
        setTimeEntriesState((prev: any) =>
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
