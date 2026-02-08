import React from 'react'
import { Modal, ModalToggler, ModalContainer } from '@faceless-ui/modal'
import { Button } from '@/components/ui/button'
import { SelectInput } from '@payloadcms/ui'
import { Textarea } from '@/components/ui/textarea'
import { CircleX } from 'lucide-react'
import { Project, User } from '@/payload-types'
import { handleAddProjectInverted } from '@/blocks/PlanningBlock/utils/inverted/handleAddProjectInverted'

type Props = {
  modalSlug: string
  projectsState: Project[]
  usersState: User[]
  selectedProjectId: string | null
  setSelectedProjectId: any
  setProjectsState: any
  router: any
  setToast: (val: { message: string; type: 'success' | 'error' }) => void
  toggleModal: (slug: string) => void
  loggedUser: User | null
}

export const InvertedProjectModal: React.FC<Props> = ({
  modalSlug,
  projectsState,
  usersState,
  selectedProjectId,
  setSelectedProjectId,
  setProjectsState,
  router,
  setToast,
  toggleModal,
  loggedUser,
}) => {
  const [selectedPmId, setSelectedPmId] = React.useState<string | null>(null)
  const [selectedFrontendId, setSelectedFrontendId] = React.useState<string | null>(null)
  const [selectedBackendId, setSelectedBackendId] = React.useState<string | null>(null)
  const [projectCommentInput, setProjectCommentInput] = React.useState('')

  const resolveRelationId = (relation: unknown): string | null => {
    if (!relation) return null
    if (typeof relation === 'string') return relation
    if (typeof relation === 'object' && 'id' in relation) {
      const relationId = (relation as { id?: string | null }).id
      return relationId || null
    }
    return null
  }

  React.useEffect(() => {
    if (!selectedProjectId) {
      setSelectedPmId(null)
      setSelectedFrontendId(null)
      setSelectedBackendId(null)
      setProjectCommentInput('')
      return
    }

    const selectedProject = projectsState.find((project) => project.id === selectedProjectId)

    setSelectedPmId(resolveRelationId((selectedProject as any)?.pm))
    setSelectedFrontendId(resolveRelationId((selectedProject as any)?.frontend))
    setSelectedBackendId(resolveRelationId((selectedProject as any)?.backend))
    setProjectCommentInput((selectedProject as any)?.comment || '')
  }, [selectedProjectId, projectsState])

  const resolveUsersByPosition = React.useCallback(
    (position: string) =>
      usersState.filter((user) => (user?.position || '').toLowerCase() === position.toLowerCase()),
    [usersState],
  )

  const pmOptions = React.useMemo(
    () => [
      { label: 'Not set', value: '' },
      ...resolveUsersByPosition('pm').map((user) => ({
        label: user.name || '',
        value: user.id,
      })),
    ],
    [resolveUsersByPosition],
  )

  const frontendOptions = React.useMemo(
    () => [
      { label: 'Not set', value: '' },
      ...resolveUsersByPosition('frontend').map((user) => ({
        label: user.name || '',
        value: user.id,
      })),
    ],
    [resolveUsersByPosition],
  )

  const backendOptions = React.useMemo(
    () => [
      { label: 'Not set', value: '' },
      ...resolveUsersByPosition('backend').map((user) => ({
        label: user.name || '',
        value: user.id,
      })),
    ],
    [resolveUsersByPosition],
  )

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
          <h2 className="text-xl font-semibold">Add new project to project view</h2>

          <SelectInput
            className="modal-select"
            path="addProject"
            name="addProject"
            options={projectsState.map((project) => ({
              label: project.title || '',
              value: project.id,
            }))}
            onChange={(e) => setSelectedProjectId((e as any)?.value)}
            value={selectedProjectId ?? undefined}
          />

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Comment</h3>
            <Textarea
              className="min-h-[88px]"
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
              handleAddProjectInverted({
                selectedProjectId,
                setSelectedProjectId,
                toggleModal,
                setProjectsState,
                router,
                modalSlug,
                setToast,
                loggedUser,
                projectsState,
                comment: projectCommentInput,
                pm: selectedPmId,
                frontend: selectedFrontendId,
                backend: selectedBackendId,
                setComment: setProjectCommentInput,
                setPm: setSelectedPmId,
                setFrontend: setSelectedFrontendId,
                setBackend: setSelectedBackendId,
              })
            }
          >
            Add
          </Button>
        </div>
      </Modal>
    </ModalContainer>
  )
}
