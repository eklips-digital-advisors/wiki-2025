import { Where } from 'payload'
import { stringify } from 'qs-esm'
import { getClientSideURL } from '@/utilities/getURL'
import { getClickedWeek } from '@/utilities/getClickedWeek'

export const onCalendarDateClick = async ({
  info,
  setClickedInfo,
  setHoursInput,
  toggleModal,
  modalSlug,
  setToast,
  loggedUser
}: {
  info: any
  setClickedInfo: (info: any) => void
  setHoursInput: (val: string) => void
  toggleModal: (slug: string) => void
  modalSlug: string
  setToast: (toast: any) => void
  loggedUser: any
}) => {
  setClickedInfo(info)

  const isEventClick = !!info.event
  const clickedDate = isEventClick ? info.event.start : info.date
  const clickedWeek = getClickedWeek(clickedDate)
  
  const projectId = isEventClick
    ? info.event.getResources()?.[0]?.extendedProps?.projectId
    : info?.resource?.extendedProps?.projectId

  const userId = isEventClick
    ? info.event.getResources()?.[0]?._resource?.parentId
    : info?.resource?._resource?.parentId
  
  if (loggedUser?.id !== userId && loggedUser.role !== 'admin') {
    setToast({ message: 'Cannot update other user unless you are admin', type: 'error' })
    return
  }

  if (!projectId) setToast({ message: 'Cannot add time to user, please add to project', type: 'error' })

  if (!projectId || !userId || !clickedDate) {
    return
  }

  const query: Where = {
    and: [
      { week: { equals: clickedWeek } },
      { project: { equals: projectId } },
      { user: { equals: userId } },
    ],
  }

  const stringifiedQuery = stringify({ where: query }, { addQueryPrefix: true })

  const res = await fetch(`${getClientSideURL()}/api/time-entries${stringifiedQuery}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  const { docs: existingEntries } = await res.json()
  const existingEntry = existingEntries?.[0]

  if (existingEntry?.hours) {
    setHoursInput(existingEntry.hours.toString())
  } else {
    setHoursInput('')
  }

  toggleModal(modalSlug)
}
