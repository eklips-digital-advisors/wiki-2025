import { Where } from 'payload'
import { stringify } from 'qs-esm'
import { getClientSideURL } from '@/utilities/getURL'

import { getClickedWeek } from '@/utilities/getClickedWeek'

export const handleSaveDateClick = async (
  info: any,
  router: any,
  hours: string,
  setTimeEntriesState: any
) => {
  // Normalize for both dateClick and eventClick
  const isEventClick = !!info.event
  const clickedDate = isEventClick ? info.event.start : info.date

  if (!hours) return

  const clickedWeek = getClickedWeek(clickedDate)

  // Get projectId and userId
  const projectId = isEventClick
    ? info.event.getResources()?.[0]?.extendedProps?.projectId
    : info?.resource?.extendedProps?.projectId

  const userId = isEventClick
    ? info.event.getResources()?.[0]?._resource?.parentId
    : info?.resource?._resource?.parentId

  if (!projectId || !userId || !clickedDate) return

  const query: Where = {
    and: [
      { week: { equals: clickedWeek } },
      { project: { equals: projectId } },
      { user: { equals: userId } },
    ],
  }

  const stringifiedQuery = stringify({ where: query }, { addQueryPrefix: true })

  try {
    const res = await fetch(`${getClientSideURL()}/api/time-entries${stringifiedQuery}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const { docs: existingEntries } = await res.json()
    const existingEntry = existingEntries?.[0]

    if (existingEntry) {
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
      console.log('Updated entry:', updated)
    } else {
      // Create a new entry
      const createRes = await fetch(`${getClientSideURL()}/api/time-entries`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours: parseInt(hours, 10),
          week: clickedWeek,
          date: clickedDate,
          project: projectId,
          user: userId,
        }),
      })
      const created = await createRes.json()
      const newTimeEntryState = created?.doc

      if (newTimeEntryState) {
        setTimeEntriesState((prev: any) => [...prev, newTimeEntryState])
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
