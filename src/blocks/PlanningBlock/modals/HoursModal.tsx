import React, { useEffect, useRef } from 'react'
import { Modal, ModalToggler, ModalContainer } from '@faceless-ui/modal'
import { Button } from '@/components/ui/button'
import { CircleX } from 'lucide-react'
import { handleSaveDateClick } from '@/blocks/PlanningBlock/utils/regular/handleSaveDateClick'
import { handleDeleteDateClick } from '@/blocks/PlanningBlock/utils/regular/handleDeleteDateClick'
import { useModal } from '@faceless-ui/modal'

type Props = {
  hoursModalSlug: string
  hoursInput: string
  setHoursInput: (val: string) => void
  clickedInfo: any
  router: any
  setTimeEntriesState: any
  setToast: (val: { message: string; type: 'success' | 'error' }) => void
  toggleModal: (slug: string) => void
}

export const HoursModal: React.FC<Props> = ({
  hoursModalSlug,
  hoursInput,
  setHoursInput,
  clickedInfo,
  router,
  setTimeEntriesState,
  setToast,
  toggleModal
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { isModalOpen } = useModal()

  useEffect(() => {
    if (isModalOpen(hoursModalSlug)) {
      inputRef.current?.focus()
    }
  }, [isModalOpen])

  return (
    <ModalContainer className="bg-zinc-800/10">
      <Modal
        className="bg-white p-4 w-100 rounded-md border border-zinc-200 left-1/2 top-1/2 -translate-1/2"
        slug={hoursModalSlug}
        onClick={(e) => e.stopPropagation()}
        closeOnBlur={false}
      >
        <ModalToggler className="absolute -right-2 -top-2 cursor-pointer border-0 focus:border-0" slug={hoursModalSlug}>
          <CircleX className="w-5 h-5 fill-white hover:stroke-emerald-500" />
        </ModalToggler>
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Update hours</h2>
          <input
            ref={inputRef}
            type="number"
            className="border border-zinc-300 rounded px-2 py-1"
            placeholder="Enter hours"
            value={hoursInput}
            onChange={(e) => setHoursInput(e.target.value)}
          />
          <div className="inline-flex gap-2 flex-wrap">
            <Button variant="link" className="cursor-pointer p-0" onClick={() => setHoursInput('2')}>+2h</Button>
            <Button variant="link" className="cursor-pointer p-0" onClick={() => setHoursInput('4')}>+4h</Button>
            <Button variant="link" className="cursor-pointer p-0" onClick={() => setHoursInput('8')}>+8h</Button>
            <Button variant="link" className="cursor-pointer p-0" onClick={() => setHoursInput('20')}>+20h</Button>
            <Button variant="link" className="cursor-pointer p-0" onClick={() => setHoursInput('40')}>+40h</Button>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Button
              variant="default"
              className="cursor-pointer self-start"
              onClick={async () => {
                await handleSaveDateClick(clickedInfo, router, hoursInput, setTimeEntriesState)
                setToast({ message: 'Hours saved', type: 'success' })
                setHoursInput('')
                toggleModal(hoursModalSlug)
              }}
              disabled={!hoursInput || Number(hoursInput) <= 0}
            >
              Save
            </Button>
            {clickedInfo?.event &&
              <Button
                variant="outline"
                className="cursor-pointer self-start"
                onClick={async () => {
                  await handleDeleteDateClick(clickedInfo, router, setTimeEntriesState, setToast)
                  setHoursInput('')
                  toggleModal(hoursModalSlug)
                }}
              >
                Delete
              </Button>
            }
          </div>
        </div>
      </Modal>
    </ModalContainer>
  )
}
