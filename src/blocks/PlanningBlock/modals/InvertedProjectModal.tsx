import React from 'react'
import { Modal, ModalToggler, ModalContainer } from '@faceless-ui/modal'
import { Button } from '@/components/ui/button'
import { SelectInput } from '@payloadcms/ui'
import { CircleX } from 'lucide-react'
import { Project, User } from '@/payload-types'
import { handleAddProjectInverted } from '@/blocks/PlanningBlock/utils/inverted/handleAddProjectInverted'

type Props = {
  modalSlug: string
  projectsState: Project[]
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
  selectedProjectId,
  setSelectedProjectId,
  setProjectsState,
  router,
  setToast,
  toggleModal,
  loggedUser,
}) => {
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
                projectsState
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
