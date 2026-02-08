import React from 'react'
import { Modal, ModalToggler, ModalContainer } from '@faceless-ui/modal'
import { Button } from '@/components/ui/button'
import { SelectInput, TextareaInput } from '@payloadcms/ui'
import { CircleX } from 'lucide-react'
import { statusOptions } from '@/collections/StatusTimeEntries/statusOptions'
import {
  handleProjectSaveDateClickInverted
} from '@/blocks/PlanningBlock/utils/inverted/handleProjectSaveDateClickInverted'
import {
  handleProjectDeleteDateClickInverted
} from '@/blocks/PlanningBlock/utils/inverted/handleProjectDeleteDateClickInverted'

type Props = {
  statusModalSlug: string
  statusInput: string
  setStatusInput: (val: string) => void
  statusComment: string
  setStatusComment: (val: string) => void
  clickedInfo: any
  router: any
  setStatusTimeEntriesState: any
  setToast: (val: { message: string; type: 'success' | 'error' }) => void
  toggleModal: (slug: string) => void
}

export const StatusModal: React.FC<Props> = ({
  statusModalSlug,
  statusInput,
  setStatusInput,
  statusComment,
  setStatusComment,
  clickedInfo,
  router,
  setStatusTimeEntriesState,
  setToast,
  toggleModal
}) => {
  return (
    <ModalContainer className="bg-zinc-800/10">
      <Modal
        className="bg-white p-4 w-100 rounded-md border border-zinc-200 left-1/2 top-1/2 -translate-1/2"
        slug={statusModalSlug}
        onClick={(e) => e.stopPropagation()}
        closeOnBlur={false}
      >
        <ModalToggler className="absolute -right-2 -top-2 cursor-pointer border-0 focus:border-0" slug={statusModalSlug}>
          <CircleX className="w-5 h-5 fill-white hover:stroke-emerald-500" />
        </ModalToggler>
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Update status</h2>
          <SelectInput
            className="modal-select"
            path="addStatus"
            name="addStatus"
            value={statusInput}
            options={statusOptions.map((status) => ({
              label: status.label || '',
              value: status.value,
            }))}
            onChange={(e) => setStatusInput((e as any)?.value)}
          />
          <div>
            <h3 className="mb-2 font-semibold">Comment</h3>
            <TextareaInput
              className="border border-zinc-100"
              path="addStatusComment"
              rows={3}
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Button
              variant="default"
              className="cursor-pointer self-start"
              onClick={async () => {
                await handleProjectSaveDateClickInverted(clickedInfo, router, statusInput, statusComment,
                  setStatusTimeEntriesState
                )
                setToast({ message: 'Project status saved successfully.', type: 'success' })
                setStatusInput(statusOptions[0].value)
                toggleModal(statusModalSlug)
              }}
            >
              Save
            </Button>
            {clickedInfo?.event &&
              <Button
                variant="outline"
                className="cursor-pointer self-start"
                onClick={async () => {
                  await handleProjectDeleteDateClickInverted(clickedInfo, router, setStatusTimeEntriesState, setToast)
                  setStatusInput(statusOptions[0].value)
                  toggleModal(statusModalSlug)
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
