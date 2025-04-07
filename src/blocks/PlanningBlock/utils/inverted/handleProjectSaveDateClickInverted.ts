import { getClientSideURL } from '@/utilities/getURL'

export const handleProjectSaveDateClickInverted = async (
  info: any,
  router: any,
  status: string | null,
  statusComment: string | null,
  setStatusTimeEntriesState: any
) => {
  // Normalize for both dateClick and eventClick
  const isEventClick = !!info.event

  const start = isEventClick
    ? info.event.start
    : info.start;

  const end = isEventClick
    ? info.event.end
    : info.end;

  if (!status) return

  const projectId = isEventClick
    ? info.event.getResources?.()?.[0]?._resource?.id
    : info.resource?.id;

  if (!projectId || !start) return
  
  const eventId = info?.event?.id

  try {
    if (eventId) {

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
            body: JSON.stringify({ status: status, comment: statusComment }),
          }
        )
        const updated = await updateRes.json()
        const newTimeEntryState = updated?.doc

        if (newTimeEntryState) {
          setStatusTimeEntriesState((prev: any) =>
            prev.map((entry: any) => (entry.id === newTimeEntryState.id ? newTimeEntryState : entry)),
          )
        }
        console.log('Updated entry:', updated)
      }
    } else {
      // Create a new entry
      const createRes = await fetch(`${getClientSideURL()}/api/status-time-entries`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status,
          comment: statusComment,
          start: start,
          end: end,
          project: projectId,
        }),
      })
      const created = await createRes.json()
      const newTimeEntryState = created?.doc

      if (newTimeEntryState) {
        setStatusTimeEntriesState((prev: any) => [...prev, newTimeEntryState])
      }

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
  }
}
