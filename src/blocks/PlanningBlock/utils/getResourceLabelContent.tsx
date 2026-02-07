import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ProfileImage } from '@/blocks/PlanningBlock/ProfileImage'
import { TeamworkTasksDropdown } from '@/blocks/PlanningBlock/TeamworkTasksDropdown'
import { PackagePlus, CircleX, Info, Flag } from 'lucide-react'
import { getLabel } from '@/utilities/getLabel'
import { positionOptions } from '@/collections/Users/positionOptions'
import { handleRemoveProject } from '@/blocks/PlanningBlock/utils/regular/handleRemoveProject'
import { handleRemoveProjectInverted } from '@/blocks/PlanningBlock/utils/inverted/handleRemoveProjectInverted'
import { handleProjectPriority } from '@/blocks/PlanningBlock/utils/regular/handleProjectPriority'
import { priorityOptions, ProjectPriority } from '@/collections/Projects/priorityOptions'

const priorityColorMap: Record<ProjectPriority, string> = {
  none: 'text-zinc-300',
  low: 'text-emerald-500',
  medium: 'text-amber-500',
  high: 'text-rose-500',
}

type Props = {
  isInverted: boolean
  loggedUser: any
  setSelectedResource: (val: any) => void
  toggleModal: (slug: string) => void
  modalSlug: string
  setUsersState: any
  router: any
  setToast: (val: { message: string; type: 'success' | 'error' }) => void
  setProjectsState: any,
  setProjectComment: (val: string) => void,
}

export const getResourceLabelContent = ({
  isInverted,
  loggedUser,
  setSelectedResource,
  toggleModal,
  modalSlug,
  setUsersState,
  router,
  setToast,
  setProjectsState,
  setProjectComment
}: Props) => {
  const ResourceLabelContent = (arg: any) => {
    const resource = arg.resource
    const type = resource._resource?.extendedProps?.type
    const projectType = resource._resource?.extendedProps?.projectType
    const comment = resource._resource?.extendedProps?.comment
    const priority = (resource?._resource?.extendedProps?.priority || 'none') as ProjectPriority
    const isProject = resource?._resource?.extendedProps?.isProject
    const showInProjectView = resource?._resource?.extendedProps?.showInProjectView
    const projectTeamworkId = resource?._resource?.extendedProps?.projectTeamwork
    const isArchived = !showInProjectView && isProject
    const shouldShowTeamworkTasks = Boolean(isInverted && isProject && projectTeamworkId)

    if (!resource._resource.parentId) {
      return (
        <div className={`flex justify-between gap-2 items-center ${type ? type : ''} ${isArchived ? 'archived' : ''}`}>
          <div className="flex gap-2 items-center ml-2">
            <ProfileImage
              name={resource._resource?.title}
              url={
                resource._resource?.extendedProps?.profileImage ||
                resource._resource?.extendedProps?.projectImage
              }
              variant={isInverted ? 'square' : 'rounded'}
            />
            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-1">
                <span
                  className="max-w-[220px] truncate leading-4 font-medium"
                  title={resource.title}
                >
                  {resource.title}
                </span>
                {shouldShowTeamworkTasks && (
                  <TeamworkTasksDropdown projectTeamworkId={projectTeamworkId} />
                )}
              </span>
              <span className="text-[12px] leading-3">
                {getLabel(resource._resource?.extendedProps?.position, positionOptions)}
              </span>
            </span>
          </div>
          {resource?._resource?.extendedProps?.isProject && isInverted && (
            <div className={`flex gap-2 items-center`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="p-0 cursor-pointer"
                    variant="link"
                    title={resource._resource?.extendedProps?.comment || 'Add comment'}
                    onClick={() => {
                      if (!loggedUser) {
                        setToast({ message: 'Please log in', type: 'error' })
                        return
                      }

                      setProjectComment(comment || '')
                      setSelectedResource(resource)
                      toggleModal('project-comment-modal')
                    }}
                  >
                    <Info className={`w-[20px] h-[20px]  ${resource._resource?.extendedProps?.comment ? 'stroke-zinc-400 hover:stroke-zinc-300' : 'stroke-zinc-200 hover:stroke-zinc-100'}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {resource._resource?.extendedProps?.comment || 'Add comment'}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="p-0 cursor-pointer"
                    variant="link"
                    title="Remove project"
                    onClick={() =>
                      handleRemoveProjectInverted(resource, setProjectsState, router, setToast, loggedUser)
                    }
                  >
                    <CircleX className="w-[20px] h-[20px] stroke-zinc-400 hover:stroke-zinc-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Remove project</TooltipContent>
              </Tooltip>
            </div>
          )}
          {!isInverted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  title="Add project"
                  className="text-xs cursor-pointer flex items-center"
                  onClick={() => {
                    if (!loggedUser) {
                      setToast({ message: 'Please log in', type: 'error' })
                      return
                    }

                    setSelectedResource(resource)
                    toggleModal(modalSlug)
                  }}
                >
                  <PackagePlus className="w-[20px] h-[20px] stroke-zinc-500 hover:stroke-emerald-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">Add project</TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    }

    return (
      <div className={`flex justify-between gap-2 ${projectType ? projectType : ''}`}>
        <div className="flex gap-2 items-center">
          <span className="text-sm">{resource.title}</span>
          <ProfileImage
            name={resource._resource?.title}
            url={
              resource._resource?.extendedProps?.projectImage ||
              resource._resource?.extendedProps?.profileImage
            }
            size={20}
            variant={!isInverted ? 'square' : 'rounded'}
          />
        </div>
        {resource.title && !isInverted && (
          <div className={`flex gap-2 items-center`}>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="link" size="clear" className="cursor-pointer focus-visible:hidden">
                      <Flag className={`w-[18px] h-[18px] ${priorityColorMap[priority]}`} />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="left">Set priority</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="bg-white z-[60]">
                {priorityOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className="hover:bg-zinc-100"
                    onSelect={() =>
                      handleProjectPriority({
                        resource,
                        priority: option.value,
                        setUsersState,
                        setProjectsState,
                        router,
                        setToast,
                        loggedUser,
                      })
                    }
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="p-0 cursor-pointer"
                  variant="link"
                  title={resource._resource?.extendedProps?.comment || 'Add comment'}
                  onClick={() => {
                    if (!loggedUser) {
                      setToast({ message: 'Please log in', type: 'error' })
                      return
                    }

                    setProjectComment(comment || '')
                    setSelectedResource(resource)
                    toggleModal('project-comment-modal')
                  }}
                >
                  <Info className={`w-[20px] h-[20px]  ${resource._resource?.extendedProps?.comment ? 'stroke-zinc-400 hover:stroke-zinc-300' : 'stroke-zinc-200 hover:stroke-zinc-100'}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {resource._resource?.extendedProps?.comment || 'Add comment'}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="p-0 cursor-pointer"
                  variant="link"
                  title="Remove project"
                  onClick={() =>
                    handleRemoveProject(resource, setUsersState, router, setToast, loggedUser)
                  }
                >
                  <CircleX className="w-[20px] h-[20px] stroke-zinc-400 hover:stroke-zinc-300" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Remove project</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    )
  }

  ResourceLabelContent.displayName = 'ResourceLabelContent'

  return ResourceLabelContent
}
