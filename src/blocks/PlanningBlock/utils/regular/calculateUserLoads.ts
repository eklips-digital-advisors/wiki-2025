import { TimeEntry } from '@/payload-types'

// ---- UTC helpers (no timezone/DST surprises) ----
const DAY_MS = 24 * 60 * 60 * 1000

const toUTCStartOfDay = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))

const addDaysUTC = (d: Date, days: number) =>
  new Date(d.getTime() + days * DAY_MS)

// Monday = 1 (ISO week); returns 00:00:00Z
const startOfISOWeekUTC = (d: Date) => {
  const sod = toUTCStartOfDay(d)
  const dow = sod.getUTCDay() // 0..6 (Sun..Sat)
  const isoDow = dow === 0 ? 7 : dow // 1..7 (Mon..Sun)
  return addDaysUTC(sod, 1 - isoDow) // back to Monday 00:00Z
}

// -------------------------------------------------

export type UserWeeklyLoads = Record<string, Record<string, number>>

export const calculateUserWeeklyLoads = (timeEntries: TimeEntry[]): UserWeeklyLoads => {
  const weeklyHours: Record<string, Record<string, number>> = {}

  timeEntries.forEach((event: any) => {
    const userId = event.user.id
    const projectId = event.project.id
    const userProjects = event.user.projects || []
    const projectExistsForUser = userProjects.some((p: any) =>
      (typeof p === 'object' ? p.id : p) === projectId
    )
    if (!projectExistsForUser) return

    // Parse, then do all boundary math in UTC
    const start = new Date(event.start) // ISO ok
    const end   = new Date(event.end)

    let current = start
    while (current < end) {
      const weekStartUTC = startOfISOWeekUTC(current)
      const nextWeekStartUTC = addDaysUTC(weekStartUTC, 7)
      const segmentEnd = end < nextWeekStartUTC ? end : nextWeekStartUTC

      // Key using UTC date to avoid local-time formatting drift
      const weekKey = weekStartUTC.toISOString().slice(0, 10) // yyyy-mm-dd

      weeklyHours[userId] ??= {}
      weeklyHours[userId][weekKey] ??= 0
      weeklyHours[userId][weekKey] += event.hours

      current = segmentEnd
    }
  })

  const result: Record<string, Record<string, number>> = {}
  for (const uid in weeklyHours) {
    result[uid] = {}
    for (const wk in weeklyHours[uid]) {
      result[uid][wk] = Math.round(weeklyHours[uid][wk])
    }
  }
  return result
}

export const createUserWeeklySummaryEvents = (userWeeklyLoads: UserWeeklyLoads) => {
  return Object.entries(userWeeklyLoads).flatMap(([userId, weekLoads]) =>
    Object.entries(weekLoads).map(([weekStartDate, hours]) => {
      const heightPercentSummary = Math.min((hours / 40) * 100, 100)
      const isOverloadedSummary = hours > 40
      const bgColorSummary = isOverloadedSummary ? 'bg-rose-200' : 'overload-success'

      // Build week range strictly in UTC to match <FullCalendar timeZone="UTC">
      const start = new Date(`${weekStartDate}T00:00:00.000Z`)
      const end = new Date(start.getTime() + 7 * DAY_MS) // exclusive

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
