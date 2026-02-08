import React from 'react'
import { Modal, ModalToggler, ModalContainer } from '@faceless-ui/modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CircleX } from 'lucide-react'
import { SelectInput } from '@payloadcms/ui'
import { User } from '@/payload-types'
import { handleProjectComment } from '@/blocks/PlanningBlock/utils/regular/handleProjectComment'

type Props = {
  modalSlug: string
  selectedResource: any
  usersState: User[]
  setUsersState: any
  router: any
  setToast: (val: { message: string; type: 'success' | 'error' }) => void
  toggleModal: (slug: string) => void
  loggedUser: User | null
  setProjectsState: React.Dispatch<React.SetStateAction<any[]>>
}

const resolveRelationId = (value: unknown): string | null => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value) {
    return ((value as { id?: string | null }).id || null) as string | null
  }
  return null
}

export const ProjectCommentModal: React.FC<Props> = ({
  modalSlug,
  selectedResource,
  usersState,
  setUsersState,
  router,
  setToast,
  toggleModal,
  loggedUser,
  setProjectsState,
}) => {
  const [projectCommentInput, setProjectCommentInput] = React.useState('')
  const [selectedPmId, setSelectedPmId] = React.useState<string | null>(null)
  const [selectedFrontendId, setSelectedFrontendId] = React.useState<string | null>(null)
  const [selectedBackendId, setSelectedBackendId] = React.useState<string | null>(null)

  const usersByPosition = React.useCallback(
    (position: string) =>
      usersState.filter((user) => (user?.position || '').toLowerCase() === position.toLowerCase()),
    [usersState],
  )

  const pmOptions = React.useMemo(
    () => [
      { label: 'Not set', value: '' },
      ...usersByPosition('pm').map((user) => ({
        label: user.name || '',
        value: user.id,
      })),
    ],
    [usersByPosition],
  )

  const frontendOptions = React.useMemo(
    () => [
      { label: 'Not set', value: '' },
      ...usersByPosition('frontend').map((user) => ({
        label: user.name || '',
        value: user.id,
      })),
    ],
    [usersByPosition],
  )

  const backendOptions = React.useMemo(
    () => [
      { label: 'Not set', value: '' },
      ...usersByPosition('backend').map((user) => ({
        label: user.name || '',
        value: user.id,
      })),
    ],
    [usersByPosition],
  )

  React.useEffect(() => {
    const nextComment =
      selectedResource?._resource?.extendedProps?.comment ??
      selectedResource?.extendedProps?.comment ??
      ''

    const nextPmId =
      selectedResource?._resource?.extendedProps?.pmId ??
      selectedResource?.extendedProps?.pmId ??
      resolveRelationId(selectedResource?._resource?.extendedProps?.pm)

    const nextFrontendId =
      selectedResource?._resource?.extendedProps?.frontendId ??
      selectedResource?.extendedProps?.frontendId ??
      resolveRelationId(selectedResource?._resource?.extendedProps?.frontend)

    const nextBackendId =
      selectedResource?._resource?.extendedProps?.backendId ??
      selectedResource?.extendedProps?.backendId ??
      resolveRelationId(selectedResource?._resource?.extendedProps?.backend)

    setProjectCommentInput(nextComment)
    setSelectedPmId(nextPmId || null)
    setSelectedFrontendId(nextFrontendId || null)
    setSelectedBackendId(nextBackendId || null)
  }, [selectedResource])

  return (
    <ModalContainer className="bg-zinc-800/10">
      <Modal
        className="bg-white p-4 w-100 rounded-md border border-zinc-200 left-1/2 top-1/2 -translate-1/2"
        slug={modalSlug}
        onClick={(e) => e.stopPropagation()}
        closeOnBlur={false}
      >
        <ModalToggler className="absolute -right-2 -top-2 cursor-pointer" slug={modalSlug}>
          <CircleX className="w-5 h-5 fill-white" />
        </ModalToggler>
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Edit project details</h2>

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Comment</h3>
            <Textarea
              className="min-h-[96px]"
              rows={4}
              value={projectCommentInput}
              onChange={(e) => setProjectCommentInput(e.target.value)}
              placeholder="Optional project comment"
            />
          </div>

          <SelectInput
            className="modal-select"
            path="setProjectPm"
            name="setProjectPm"
            label="PM"
            options={pmOptions}
            onChange={(e) => {
              const value = (e as any)?.value
              setSelectedPmId(value || null)
            }}
            value={selectedPmId ?? undefined}
          />

          <SelectInput
            className="modal-select"
            path="setProjectFrontend"
            name="setProjectFrontend"
            label="Frontend"
            options={frontendOptions}
            onChange={(e) => {
              const value = (e as any)?.value
              setSelectedFrontendId(value || null)
            }}
            value={selectedFrontendId ?? undefined}
          />

          <SelectInput
            className="modal-select"
            path="setProjectBackend"
            name="setProjectBackend"
            label="Backend"
            options={backendOptions}
            onChange={(e) => {
              const value = (e as any)?.value
              setSelectedBackendId(value || null)
            }}
            value={selectedBackendId ?? undefined}
          />

          <Button
            variant="default"
            className="cursor-pointer self-start"
            onClick={() =>
              handleProjectComment(
                selectedResource,
                setUsersState,
                router,
                setToast,
                loggedUser,
                projectCommentInput,
                toggleModal,
                setProjectsState,
                selectedPmId,
                selectedFrontendId,
                selectedBackendId,
              )
            }
          >
            Update
          </Button>
        </div>
      </Modal>
    </ModalContainer>
  )
}
