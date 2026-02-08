import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ProfileImage } from '@/blocks/PlanningBlock/ProfileImage'
import { TeamworkTasksDropdown } from '@/blocks/PlanningBlock/TeamworkTasksDropdown'
import { PackagePlus, CircleX, SlidersHorizontal, Flag } from 'lucide-react'
import { getLabel } from '@/utilities/getLabel'
import { positionOptions } from '@/collections/Users/positionOptions'
import { handleRemoveProject } from '@/blocks/PlanningBlock/utils/regular/handleRemoveProject'
import { handleRemoveProjectInverted } from '@/blocks/PlanningBlock/utils/inverted/handleRemoveProjectInverted'
import { handleProjectPriority } from '@/blocks/PlanningBlock/utils/regular/handleProjectPriority'
import { priorityOptions, ProjectPriority } from '@/collections/Projects/priorityOptions'
import { getClientSideURL } from '@/utilities/getURL'

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
  usersState: any
  setUsersState: any
  router: any
  setToast: (val: { message: string; type: 'success' | 'error' }) => void
  setProjectsState: any,
}

export const getResourceLabelContent = ({
  isInverted,
  loggedUser,
  setSelectedResource,
  toggleModal,
  modalSlug,
  usersState,
  setUsersState,
  router,
  setToast,
  setProjectsState,
}: Props) => {
  const getProjectDetailsSelection = (resource: any) => {
    const ext = resource?._resource?.extendedProps || resource?.extendedProps || {}
    const projectId = ext?.projectId || resource?._resource?.id || resource?.id || null

    return {
      id: resource?.id,
      title: resource?.title,
      extendedProps: {
        ...ext,
        projectId,
      },
      _resource: {
        id: projectId,
        extendedProps: {
          ...ext,
          projectId,
        },
      },
    }
  }

  const ResourceLabelContent = (arg: any) => {
    const resource = arg.resource
    const type = resource._resource?.extendedProps?.type
    const projectType = resource._resource?.extendedProps?.projectType
    const priority = (resource?._resource?.extendedProps?.priority || 'none') as ProjectPriority
    const isProject = resource?._resource?.extendedProps?.isProject
    const showInProjectView = resource?._resource?.extendedProps?.showInProjectView
    const projectTeamworkId = resource?._resource?.extendedProps?.projectTeamwork
    const pmId = resource?._resource?.extendedProps?.pmId
    const pmName = resource?._resource?.extendedProps?.pmName
    const pmAvatarUrl = resource?._resource?.extendedProps?.pmAvatarUrl
    const frontendId = resource?._resource?.extendedProps?.frontendId
    const frontendName = resource?._resource?.extendedProps?.frontendName
    const frontendAvatarUrl = resource?._resource?.extendedProps?.frontendAvatarUrl
    const backendId = resource?._resource?.extendedProps?.backendId
    const backendName = resource?._resource?.extendedProps?.backendName
    const backendAvatarUrl = resource?._resource?.extendedProps?.backendAvatarUrl
    const projectComment = resource?._resource?.extendedProps?.comment || ''
    const hasProjectComment = Boolean(projectComment?.trim())
    const isArchived = !showInProjectView && isProject
    const shouldShowTeamworkTasks = Boolean(isInverted && isProject && projectTeamworkId)
    const shouldShowProjectAssignments = Boolean(isInverted && isProject)
    const assignmentSlots: Array<{
      key: 'pm' | 'frontend' | 'backend'
      label: string
      id: string | null
      name: string
      avatarUrl: string
    }> = [
      { key: 'pm', label: 'PM', id: pmId, name: pmName, avatarUrl: pmAvatarUrl },
      { key: 'frontend', label: 'Frontend', id: frontendId, name: frontendName, avatarUrl: frontendAvatarUrl },
      { key: 'backend', label: 'Backend', id: backendId, name: backendName, avatarUrl: backendAvatarUrl },
    ]
    const placeholderBorderClassByKey: Record<string, string> = {
      pm: 'border-indigo-400',
      frontend: 'border-emerald-400',
      backend: 'border-blue-400',
    }
    const projectIdForUpdate = resource?._resource?.extendedProps?.projectId || resource?._resource?.id
    const usersByRole = {
      pm: usersState.filter((user: any) => (user?.position || '').toLowerCase() === 'pm'),
      frontend: usersState.filter((user: any) => (user?.position || '').toLowerCase() === 'frontend'),
      backend: usersState.filter((user: any) => (user?.position || '').toLowerCase() === 'backend'),
    }

    const handleAssigneeUpdate = async (
      field: 'pm' | 'frontend' | 'backend',
      userId: string | null,
      roleLabel: string,
    ) => {
      if (!loggedUser) {
        setToast({ message: 'Please sign in to continue.', type: 'error' })
        return
      }

      if (!projectIdForUpdate) {
        setToast({
          message: 'Unable to update project assignment: missing project reference.',
          type: 'error',
        })
        return
      }

      try {
        const req = await fetch(`${getClientSideURL()}/api/projects/${projectIdForUpdate}?depth=2`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            [field]: userId,
          }),
        })

        if (!req.ok) {
          throw new Error(`Failed to update ${field}: ${req.status}`)
        }

        const data = await req.json()
        const updatedProject = data?.doc

        if (!updatedProject) {
          throw new Error('No updated project document returned')
        }

        setProjectsState((prev: any[]) =>
          prev.map((project) => (project.id === updatedProject.id ? updatedProject : project)),
        )

        setUsersState((prev: any[]) =>
          prev.map((user) =>
            !user.projects
              ? user
              : {
                  ...user,
                  projects: user.projects.map((project: any) =>
                    project.id === updatedProject.id ? updatedProject : project,
                  ),
                },
          ),
        )

        setToast({
          message: userId
            ? `${roleLabel} assignment updated successfully.`
            : `${roleLabel} assignment cleared.`,
          type: 'success',
        })
      } catch (error) {
        console.log(error)
        setToast({ message: `Unable to update ${roleLabel} assignment.`, type: 'error' })
      }
    }

    if (!resource._resource.parentId) {
      return (
        <div
          className={`flex justify-between gap-2 items-center ${type ? type : ''} ${isArchived ? 'archived' : ''}`}
        >
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
              <span className="flex items-center gap-2">
                <span
                  className="max-w-[170px] truncate leading-4 font-medium"
                  title={resource.title}
                >
                  {resource.title}
                </span>
                {shouldShowProjectAssignments && (
                  <span className="inline-flex items-center gap-1">
                    {shouldShowTeamworkTasks && (
                      <TeamworkTasksDropdown projectTeamworkId={projectTeamworkId} />
                    )}
                    <span className="inline-flex items-center gap-1">
                      {assignmentSlots.map((slot) => (
                        <DropdownMenu key={slot.key}>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-[20px] w-[20px] items-center justify-center cursor-pointer"
                              title={`${slot.label}: ${slot.name || 'Not set'}`}
                              onClick={(event) => {
                                if (loggedUser) return
                                event.preventDefault()
                                event.stopPropagation()
                                setToast({ message: 'Please sign in to continue.', type: 'error' })
                              }}
                            >
                              {slot.id ? (
                                <ProfileImage
                                  name={slot.name || slot.label}
                                  url={slot.avatarUrl || ''}
                                  size={20}
                                  variant="rounded"
                                />
                              ) : (
                                <span
                                  className={`inline-flex h-[20px] w-[20px] rounded-full border-[1.5px] border-dotted bg-white ${placeholderBorderClassByKey[slot.key] || 'border-zinc-300'}`}
                                />
                              )}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-white z-[80] min-w-[220px]">
                            <DropdownMenuLabel>{slot.label}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => void handleAssigneeUpdate(slot.key, null, slot.label)}
                            >
                              Clear assignment
                            </DropdownMenuItem>
                            {usersByRole[slot.key].map((user: any) => (
                              <DropdownMenuItem
                                key={`${slot.key}-${user.id}`}
                                onSelect={() => void handleAssigneeUpdate(slot.key, user.id, slot.label)}
                                className="flex items-center gap-2"
                              >
                                <ProfileImage
                                  name={user.name || slot.label}
                                  url={(user?.media?.url as string) || ''}
                                  size={16}
                                  variant="rounded"
                                />
                                <span>{user.name || 'Unnamed user'}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ))}
                    </span>
                  </span>
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
                    title="Edit project details"
                    onClick={() => {
                      if (!loggedUser) {
                        setToast({ message: 'Please sign in to continue.', type: 'error' })
                        return
                      }

                      setSelectedResource(getProjectDetailsSelection(resource))
                      toggleModal('project-comment-modal')
                    }}
                  >
                    <SlidersHorizontal
                      className={`w-[20px] h-[20px] ${hasProjectComment ? 'stroke-zinc-700 hover:stroke-zinc-800' : 'stroke-zinc-400 hover:stroke-zinc-300'}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="max-w-[340px] whitespace-pre-wrap break-words leading-5"
                >
                  <span className="block font-medium">Edit project details</span>
                  {hasProjectComment && (
                    <span className="mt-1 block text-[11px] opacity-90">{projectComment}</span>
                  )}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="p-0 cursor-pointer"
                    variant="link"
                    title="Remove project"
                    onClick={() =>
                      handleRemoveProjectInverted(
                        resource,
                        setProjectsState,
                        router,
                        setToast,
                        loggedUser,
                      )
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
                      setToast({ message: 'Please sign in to continue.', type: 'error' })
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
                    <Button
                      variant="link"
                      size="clear"
                      className="cursor-pointer focus-visible:hidden"
                    >
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
                  title="Edit project details"
                  onClick={() => {
                    if (!loggedUser) {
                      setToast({ message: 'Please sign in to continue.', type: 'error' })
                      return
                    }

                    setSelectedResource(getProjectDetailsSelection(resource))
                    toggleModal('project-comment-modal')
                  }}
                >
                  <SlidersHorizontal
                    className={`w-[20px] h-[20px] ${hasProjectComment ? 'stroke-zinc-700 hover:stroke-zinc-800' : 'stroke-zinc-400 hover:stroke-zinc-300'}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[340px] whitespace-pre-wrap break-words leading-5"
              >
                <span className="block font-medium">Edit project details</span>
                {hasProjectComment && (
                  <span className="mt-1 block text-[11px] opacity-90">{projectComment}</span>
                )}
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
