type TeamworkCalendarEvent = {
  id: string | number
  title: string
  start: string
  end: string
}

const TEAMWORK_CALENDAR_CACHE_TTL_MS = process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 60 * 1000
let cachedEvents: TeamworkCalendarEvent[] = []
let cachedEventsAt = 0

export const GetTeamworkEvents = async (): Promise<TeamworkCalendarEvent[]> => {
  const API_KEY = process.env.TEAMWORK_API_KEY
  const BASE_URL = process.env.TEAMWORK_BASE_URL

  if (!API_KEY || !BASE_URL) {
    return []
  }

  if (cachedEventsAt && Date.now() - cachedEventsAt < TEAMWORK_CALENDAR_CACHE_TTL_MS) {
    return cachedEvents
  }

  const today = new Date()
  const startDate = new Date(today)
  startDate.setMonth(startDate.getMonth() - 1)

  const endDate = new Date(today)
  endDate.setMonth(endDate.getMonth() + 3)

  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  const start = formatDate(startDate)
  const end = formatDate(endDate)

  const API_URL = `${BASE_URL}/projects/api/v3/calendar/events.json?startDate=${start}&endDate=${end}&pageSize=500`

  try {
    const headers = {
      Authorization: `Basic ${Buffer.from(`${API_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(API_URL, { headers })

    if (response.status === 429) {
      return cachedEvents
    }

    if (!response.ok) {
      return cachedEvents
    }

    const data = await response.json()
    const events = (data.calendarEvents || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
    }))

    cachedEvents = events
    cachedEventsAt = Date.now()

    return events
  } catch (_error) {
    return cachedEvents
  }
}
