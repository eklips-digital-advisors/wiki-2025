import React from 'react'
import { Modal, ModalToggler, ModalContainer } from '@faceless-ui/modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CircleX } from 'lucide-react'
import { User } from '@/payload-types'
import { handleProjectComment } from '@/blocks/PlanningBlock/utils/regular/handleProjectComment'

type Props = {
  modalSlug: string
  selectedResource: any
  setUsersState: any
  router: any
  setToast: (val: { message: string; type: 'success' | 'error' }) => void
  toggleModal: (slug: string) => void
  loggedUser: User | null
  setProjectsState: React.Dispatch<React.SetStateAction<any[]>>
}

export const ProjectCommentModal: React.FC<Props> = ({
  modalSlug,
  selectedResource,
  setUsersState,
  router,
  setToast,
  toggleModal,
  loggedUser,
  setProjectsState
}) => {
  const [projectCommentInput, setProjectCommentInput] = React.useState('')

  React.useEffect(() => {
    const nextComment =
      selectedResource?._resource?.extendedProps?.comment ??
      selectedResource?.extendedProps?.comment ??
      ''
    setProjectCommentInput(nextComment)
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
          <h2 className="text-xl font-semibold">Update project comment</h2>
          <Textarea
            className="min-h-[96px]"
            rows={4}
            value={projectCommentInput}
            onChange={(e) => setProjectCommentInput(e.target.value)}
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
                setProjectsState
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
