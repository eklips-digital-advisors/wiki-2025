import { getClientSideURL } from '@/utilities/getURL'
import { statusOptions } from '@/collections/StatusTimeEntries/statusOptions'

export const onCalendarProjectDateClickInverted = async ({
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

  if (isEventClick && info.event?.extendedProps?.type || info?.resource?._resource?.id === 'eklips-vacation') {
    setToast({ message: 'Cannot edit teamwork vacations', type: 'error' })
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
