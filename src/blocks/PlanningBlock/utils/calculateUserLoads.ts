import { TimeEntry } from '@/payload-types'

export type UserDailyLoads = Record<string, Record<string, number>>

export const calculateUserDailyLoads = (timeEntries: TimeEntry[]): UserDailyLoads => {
  const loads: UserDailyLoads = {}

  timeEntries.forEach((entry: any) => {
    const userId = entry.user.id
    const projectId = entry.project.id
    const userProjects = entry.user.projects || []

    const projectExistsForUser = userProjects.some((p: any) =>
      typeof p === 'object' ? p.id === projectId : p === projectId
    )

    if (!projectExistsForUser) return

    const date = new Date(entry.date).toISOString().split('T')[0]

    if (!loads[userId]) loads[userId] = {}
    if (!loads[userId][date]) loads[userId][date] = 0

    loads[userId][date] += entry.hours
  })

  return loads
}

export const createUserSummaryEvents = (userDailyLoads: UserDailyLoads) => {
  return Object.entries(userDailyLoads).flatMap(([userId, dayLoads]) =>
    Object.entries(dayLoads).map(([date, hours]) => {
      const heightPercentSummary = Math.min((hours / 8) * 100, 100)
      const isOverloadedSummary = hours > 8
      const bgColorSummary = isOverloadedSummary ? 'bg-rose-200/70' : 'bg-emerald-200/70'

      return {
        id: `summary-${userId}-${date}`,
        resourceId: userId,
        title: `${hours}h`,
        start: new Date(date).toISOString(),
        end: new Date(new Date(date).setDate(new Date(date).getDate() + 1)).toISOString(),
        extendedProps: {
          isSummary: true,
          hours,
          bgColorSummary,
          heightPercentSummary,
        },
      }
    })
  )
}
