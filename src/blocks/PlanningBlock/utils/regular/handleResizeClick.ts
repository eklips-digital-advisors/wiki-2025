import { getClientSideURL } from '@/utilities/getURL'

export const handleResizeClick = async (
  info: any,
  router: any,
  setTimeEntriesState: any,
  loggedUser: any,
  setToast: any
) => {
  const isEventClick = !!info.event

  const start = isEventClick
    ? info.event.start
    : info.start;

  const end = isEventClick
    ? info.event.end
    : info.end;

  const eventId = info?.event?.id?.split?.('-')?.[0]?.trim()

  if (!eventId || !start) return

  try {
    const res = await fetch(`${getClientSideURL()}/api/time-entries/${eventId}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const existingEntry = await res.json()

    if (existingEntry && existingEntry.id) {
      const updateRes = await fetch(`${getClientSideURL()}/api/time-entries/${existingEntry.id}`,
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
        setTimeEntriesState((prev: any) =>
          prev.map((entry: any) => (entry.id === newTimeEntryState.id ? newTimeEntryState : entry)),
        )
      }
      setToast({ message: 'Time entry updated', type: 'success' })
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
    setToast({ message: 'Failed to update time entry', type: 'error' })
    console.error('Error handling time entry:', err)
  }
}
