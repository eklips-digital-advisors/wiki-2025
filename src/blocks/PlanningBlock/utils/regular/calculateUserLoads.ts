import { TimeEntry } from '@/payload-types'
import {
  parseISO,
  startOfWeek,
  endOfWeek,
  addDays,
  format
} from 'date-fns'

export type UserWeeklyLoads = Record<string, Record<string, number>>

export const calculateUserWeeklyLoads = (timeEntries: TimeEntry[]): UserWeeklyLoads => {
  const weeklyHours: Record<string, Record<string, number>> = {}

  timeEntries.forEach((event: any) => {
    const userId = event.user.id
    const projectId = event.project.id
    const userProjects = event.user.projects || []

    const projectExistsForUser = userProjects.some((p: any) =>
      typeof p === 'object' ? p.id === projectId : p === projectId
    )

    if (!projectExistsForUser) return

    const start = parseISO(event.start)
    const end = parseISO(event.end)

    let current = start

    while (current < end) {
      const weekStart = startOfWeek(current, { weekStartsOn: 1 }) // Monday
      const weekEnd = endOfWeek(current, { weekStartsOn: 1 }) // Sunday
      const segmentEnd = end < addDays(weekEnd, 1) ? end : addDays(weekEnd, 1)

      const weekKey = format(weekStart, 'yyyy-MM-dd') // Use week start date as key

      if (!weeklyHours[userId]) {
        weeklyHours[userId] = {}
      }

      if (!weeklyHours[userId][weekKey]) {
        weeklyHours[userId][weekKey] = 0
      }

      weeklyHours[userId][weekKey] += event.hours

      current = segmentEnd
    }
  })

  const result: Record<string, Record<string, number>> = {}

  for (const userId in weeklyHours) {
    result[userId] = {}

    for (const weekKey in weeklyHours[userId]) {
      result[userId][weekKey] = Math.round(weeklyHours[userId][weekKey])
    }
  }

  return result
}

export const createUserWeeklySummaryEvents = (userWeeklyLoads: UserWeeklyLoads) => {
  return Object.entries(userWeeklyLoads).flatMap(([userId, weekLoads]) =>
    Object.entries(weekLoads).map(([weekStartDate, hours]) => {
      const heightPercentSummary = Math.min((hours / 40) * 100, 100) // Assuming 40h/week load
      const isOverloadedSummary = hours > 40
      const bgColorSummary = isOverloadedSummary ? 'bg-rose-200' : 'bg-emerald-200'

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
