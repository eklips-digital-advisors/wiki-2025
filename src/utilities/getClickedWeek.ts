import { DateTime } from 'luxon'

export const getClickedWeek = (date: Date) => {
  return DateTime.fromJSDate(date).startOf('week').toFormat("kkkk-'W'WW")
}
