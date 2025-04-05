import { StatusTimeEntry, TimeEntry } from '@/payload-types'
import { getLabel } from '@/utilities/getLabel'
import { statusOptions } from '@/collections/StatusTimeEntries/statusOptions'

export const getInvertedEvents = (statusTimeEntriesState: StatusTimeEntry[] = []) =>
  (statusTimeEntriesState || []).flatMap((entry: any) => {
    const startDate = new Date(entry.start)
    const endDate = new Date(entry.end)

    return {
      id: `${entry.id}`,
      resourceId: `${entry.project.id}`,
      title: `${getLabel(entry.status, statusOptions)}`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    }
  })

export const getProjectEventsInverted = (timeEntriesState: TimeEntry[] = []) =>
  (timeEntriesState || []).flatMap((entry: any) => {
    const startDate = new Date(entry.start)
    const endDate = new Date(entry.end)

    return {
      id: `${entry.id}-${entry.user.id}`,
      resourceId: `user-${entry.user.id}-${entry.project.id}`,
      title: `${entry.hours}h`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    }
  })

export const getTeamworkEventsForInverted = (teamworkEvents: any[] = []) =>
  (teamworkEvents || []).flatMap((entry: any) => {
    const startDate = new Date(entry.start)
    const endDate = new Date(entry.end)

    return {
      id: `${entry.id}`,
      resourceId: entry.title.toLowerCase().includes('vacation')
        ? 'eklips-vacation'
        : 'eklips-internal',
      title: entry.title || 'Untitled Event',
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      type: entry.title.toLowerCase().includes('vacation') ? 'vacation default' : 'default',
    }
  })
