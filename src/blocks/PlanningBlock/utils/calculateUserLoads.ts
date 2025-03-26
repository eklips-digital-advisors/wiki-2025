import { TimeEntry } from '@/payload-types'

export type UserWeeklyLoads = Record<string, Record<string, number>>

export const calculateUserWeeklyLoads = (timeEntries: TimeEntry[]): UserWeeklyLoads => {
  const loads: UserWeeklyLoads = {}

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

export const createUserWeeklySummaryEvents = (userWeeklyLoads: UserWeeklyLoads) => {
  return Object.entries(userWeeklyLoads).flatMap(([userId, weekLoads]) =>
    Object.entries(weekLoads).map(([weekStartDate, hours]) => {
      const heightPercentSummary = Math.min((hours / 40) * 100, 100) // Assuming 40h/week load
      const isOverloadedSummary = hours > 40
      const bgColorSummary = isOverloadedSummary ? 'bg-rose-200/70' : 'bg-emerald-200/70'

      const start = new Date(weekStartDate)
      const end = new Date(start)
      end.setDate(start.getDate() + 7) // full week

      return {
        id: `summary-${userId}-${weekStartDate}`,
        resourceId: userId,
        title: `${hours}h`,
        start: start.toISOString(),
        end: end.toISOString(),
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
