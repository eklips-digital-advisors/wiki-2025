import { getClientSideURL } from '@/utilities/getURL'
import { statusOptions } from '@/collections/StatusTimeEntries/statusOptions'

export const onCalendarDateClickInverted = async ({
  info,
  setClickedInfo,
  setStatusInput,
  toggleModal,
  modalSlug,
  setToast,
  loggedUser,
}: {
  info: any
  setClickedInfo: (info: any) => void
  setStatusInput: (val: string) => void
  toggleModal: (slug: string) => void
  modalSlug: string
  setToast: (toast: any) => void
  loggedUser: any
}) => {
  setClickedInfo(info)

  const isEventClick = !!info.event
  const isResourceClick = !!info.resource

  const start = isEventClick ? info.event.start : info.start

  const projectId = isEventClick
    ? info.event.getResources?.()?.[0]?._resource?.id
    : info.resource?.id

  if (loggedUser.role !== 'admin') {
    setToast({ message: 'Cannot update other user unless you are admin', type: 'error' })
    return
  }

  if (isResourceClick && info.resource?._resource?.parentId) {
    setToast({ message: 'Log time on users on users view', type: 'error' })
    return
  }

  if (isEventClick && info.event.getResources?.()?.[0]?._resource.parentId) {
    setToast({ message: 'Update time on users on users view', type: 'error' })
    return
  }

  if (isEventClick && info.event?.extendedProps?.type) {
    setToast({ message: 'Cannot edit teamwork events', type: 'error' })
    return
  }

  if (!projectId)
    setToast({ message: 'Cannot add time to user, please add to project', type: 'error' })

  if (!projectId || !start) {
    return
  }
  
  const eventId = info?.event?.id

  if (eventId) {
    const res = await fetch(`${getClientSideURL()}/api/status-time-entries/${eventId}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const existingEntry = await res.json()

    if (existingEntry?.status) {
      setStatusInput(existingEntry.status)
    } else {
      setStatusInput(statusOptions[0].value)
    }
  } else {
    setStatusInput(statusOptions[0].value)
  }

  toggleModal(modalSlug)
}
