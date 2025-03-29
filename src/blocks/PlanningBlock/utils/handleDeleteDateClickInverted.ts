import { Where } from 'payload'
import { stringify } from 'qs-esm'
import { getClientSideURL } from '@/utilities/getURL'

export const handleDeleteDateClickInverted = async (
  info: any,
  router: any,
  setStatusTimeEntriesState: any
) => {
  // Normalize for both dateClick and eventClick
  const isEventClick = !!info.event
  const start = isEventClick ? info.event.start : info.date

  // Get projectId and userId
  const projectId = isEventClick
    ? info.event.getResources?.()?.[0]?._resource?.id
    : info.resource?.id;

  if (!projectId || !start) return

  const query: Where = {
    and: [
      { start: { equals: start } },
      { project: { equals: projectId } },
    ],
  }

  const stringifiedQuery = stringify({ where: query }, { addQueryPrefix: true })

  try {
    const res = await fetch(`${getClientSideURL()}/api/status-time-entries${stringifiedQuery}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const { docs: existingEntries } = await res.json()
    const existingEntry = existingEntries?.[0]

    if (!existingEntry?.id) return

    await fetch(`${getClientSideURL()}/api/status-time-entries/${existingEntry.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    setStatusTimeEntriesState((prev: any) => prev.filter((entry: any) => entry.id !== existingEntry.id))

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
