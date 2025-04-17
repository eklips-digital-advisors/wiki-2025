import { TimeEntry } from '@/payload-types'

export const getProjectEvents = (timeEntriesState: TimeEntry[] = []) =>
  (timeEntriesState || []).flatMap((entry: any) => {
    const startDate = new Date(entry.start)
    const endDate = new Date(entry.end)

    return {
      id: `${entry.id}-${entry.user.id}`,
      resourceId: `project-${entry.project.id}-${entry.user.id}`,
      title: `${entry.hours}h`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      type: entry.user.position || '',
    }
  })
