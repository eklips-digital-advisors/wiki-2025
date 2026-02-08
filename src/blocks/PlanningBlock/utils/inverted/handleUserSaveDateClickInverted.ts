import { getClientSideURL } from '@/utilities/getURL'

export const handleUserSaveDateClickInverted = async (
  info: any,
  router: any,
  hours: string,
  setTimeEntriesState: any,
  setToast: any
) => {
  // Normalize for both dateClick and eventClick
  const isEventClick = !!info.event

  const start = isEventClick
    ? info.event.start
    : info.start;

  const end = isEventClick
    ? info.event.end
    : info.end;

  if (!hours) return

  // Get projectId and userId
  const projectId = isEventClick
    ? info?.event?.getResources()?.[0]?.extendedProps?.projectId
    : info?.resource?.extendedProps?.projectId

  const userId = isEventClick
    ? info?.event?.getResources()?.[0]?.extendedProps?.userId
    : info?.resource?._resource?.extendedProps?.userId

  if (!projectId || !userId || !start) return

  const eventId = info?.event?.id?.split?.('-')?.[0]?.trim()

  try {
    if (eventId) {
      const res = await fetch(`${getClientSideURL()}/api/time-entries/${eventId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
  
      const existingEntry = await res.json()

      if (existingEntry && existingEntry.id) {
        // Update the existing entry
        const updateRes = await fetch(
          `${getClientSideURL()}/api/time-entries/${existingEntry.id}`,
          {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hours: parseInt(hours, 10) }),
          }
        )
        const updated = await updateRes.json()
        const newTimeEntryState = updated?.doc
  
        if (newTimeEntryState) {
          setTimeEntriesState((prev: any) =>
            prev.map((entry: any) => (entry.id === newTimeEntryState.id ? newTimeEntryState : entry)),
          )
        }
        setToast({ message: 'Hours entry updated successfully.', type: 'success' })
        console.log('Updated entry:', updated) 
      }
    } else {
      // Create a new entry
      const createRes = await fetch(`${getClientSideURL()}/api/time-entries`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours: parseInt(hours, 10),
          start: start,
          end: end,
          project: projectId,
          user: userId,
        }),
      })
      const created = await createRes.json()
      const newTimeEntryState = created?.doc

      if (newTimeEntryState) {
        setTimeEntriesState((prev: any) => [...prev, newTimeEntryState])
      }

      setToast({ message: 'Hours entry created successfully.', type: 'success' })
      console.log('Created entry:', created)
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
    console.error('Error handling time entry:', err)
    setToast({ message: 'Unable to save hours entry.', type: 'error' })
  }
}
