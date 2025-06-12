import React from 'react'
import { Button } from '@/components/ui/button'
import Tooltip from '@/components/Tooltip'
import { ProfileImage } from '@/blocks/PlanningBlock/ProfileImage'
import { PackagePlus, CircleX } from 'lucide-react'
import { getLabel } from '@/utilities/getLabel'
import { positionOptions } from '@/collections/Users/positionOptions'
import { handleRemoveProject } from '@/blocks/PlanningBlock/utils/regular/handleRemoveProject'
import { handleRemoveProjectInverted } from '@/blocks/PlanningBlock/utils/inverted/handleRemoveProjectInverted'

type Props = {
  isInverted: boolean
  loggedUser: any
  setSelectedResource: (val: any) => void
  toggleModal: (slug: string) => void
  modalSlug: string
  setUsersState: any
  router: any
  setToast: (val: { message: string; type: 'success' | 'error' }) => void
  setProjectsState: any
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
  setProjectsState
}: Props) => {
  const ResourceLabelContent = (arg: any) => {
    const resource = arg.resource
    const type = resource._resource?.extendedProps?.type
    const projectType = resource._resource?.extendedProps?.projectType

    if (!resource._resource.parentId) {
      return (
        <div className={`flex justify-between gap-2 items-center ${type ? type : ''}`}>
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
              <span className="leading-4">{resource.title}</span>
              <span className="text-[12px] leading-3">
                {getLabel(resource._resource?.extendedProps?.position, positionOptions)}
              </span>
            </span>
          </div>
          {!resource?._resource?.extendedProps?.type && isInverted && (
            <Button
              className="p-0 cursor-pointer"
              variant="link"
              title="Remove project"
              onClick={() =>
                handleRemoveProjectInverted(resource, setProjectsState, router, setToast, loggedUser)
              }
            >
              <Tooltip content="Remove project" position="left">
                <CircleX className="w-[20px] h-[20px] stroke-zinc-400 hover:stroke-zinc-300" />
              </Tooltip>
            </Button>
          )}
          {!isInverted && (
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
              <Tooltip content="Add project" position="left">
                <PackagePlus className="w-[20px] h-[20px] stroke-zinc-500 hover:stroke-emerald-400" />
              </Tooltip>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className={`flex justify-between gap-2 ${projectType ? projectType : ''}`}>
        <div className="flex gap-2 items-center ml-2">
          {resource.title}
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
          <Button
            className="p-0 cursor-pointer"
            variant="link"
            title="Remove project"
            onClick={() =>
              handleRemoveProject(resource, setUsersState, router, setToast, loggedUser)
            }
          >
            <Tooltip content="Remove project" position="left">
              <CircleX className="w-[20px] h-[20px] stroke-zinc-400 hover:stroke-zinc-300" />
            </Tooltip>
          </Button>
        )}
      </div>
    )
  }

  ResourceLabelContent.displayName = 'ResourceLabelContent'

  return ResourceLabelContent
}
