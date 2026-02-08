import { getClientSideURL } from '@/utilities/getURL'

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
  
  const projectId = isEventClick
    ? info.event.getResources()?.[0]?.extendedProps?.projectId
    : info?.resource?.extendedProps?.projectId

  if (!projectId) {
    setToast({ message: 'Select a project row before adding time.', type: 'error' })
  }

  if (!projectId) {
    return
  }
  
  const eventId = info?.event?.id?.split?.('-')?.[0]?.trim()

  if (eventId) {
    const res = await fetch(`${getClientSideURL()}/api/time-entries/${eventId}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const existingEntry = await res.json()

    if (existingEntry?.hours) {
      setHoursInput(existingEntry.hours.toString())
    } else {
      setHoursInput('')
    }
  } else {
    setHoursInput('')
  }

  toggleModal(modalSlug)
}
