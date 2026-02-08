import {
  ArrowDownNarrowWide,
  ListCheck,
  PackagePlus,
  ToggleLeft,
  ToggleRight,
  UserCheck,
} from 'lucide-react'
import React from 'react'
import { User } from '@/payload-types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  isInverted: boolean
  setIsInverted: React.Dispatch<React.SetStateAction<boolean>>
  sortDirection: 'asc' | 'desc'
  setSortDirection: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>
  resources: any[]
  usersState: User[]
  loggedUser: User | null
  setToast: (toast: { message: string; type: 'success' | 'error' }) => void
  toggleModal: (slug: string) => void
  invertedProjectSlug: string,
  invertedShowAllProjects: boolean,
  setInvertedShowAllProjects: React.Dispatch<React.SetStateAction<boolean>>
}

export const ResourceAreaHeaderContent: React.FC<Props> = ({
  isInverted,
  setIsInverted,
  sortDirection,
  setSortDirection,
  resources,
  usersState,
  loggedUser,
  setToast,
  toggleModal,
  invertedProjectSlug,
  invertedShowAllProjects,
  setInvertedShowAllProjects
}) => {
  const roleModalSlug = 'role-filter-modal'

  return (
    <div className="flex justify-between gap-2 items-center w-full">
      <span className="inline-flex gap-2 items-center">
        <span className="font-medium text-lg">{`${isInverted ? 'Projects' : 'People'}`}</span>
        <span className="text-xs leading-3 rounded-2xl bg-zinc-100 p-1">{`${isInverted ? resources?.filter((item: any) => item.projectImage || item.projectImage === '').length - 1 : usersState?.length}`}</span>
      </span>
      <div className="flex gap-3 items-center">
        {isInverted && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="text-xs cursor-pointer flex items-center"
                  onClick={() => setInvertedShowAllProjects((prev) => !prev)}
                >
                  <ListCheck className={`w-[20px] h-[20px] hover:stroke-emerald-400 transition-transform duration-200 ${invertedShowAllProjects ? 'stroke-emerald-500' : 'stroke-zinc-500'}`} />
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">Show archived projects</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="text-xs cursor-pointer flex items-center"
                  onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                >
                  <ArrowDownNarrowWide
                    className={`w-[20px] h-[20px] hover:stroke-emerald-400 transition-transform duration-200 ${sortDirection === 'desc' ? 'rotate-180 stroke-emerald-500' : 'rotate-0 stroke-zinc-500'}`}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">Sort based on launch date</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="text-xs cursor-pointer flex items-center mr-2"
                  onClick={() => {
                    if (!loggedUser) {
                      setToast({ message: 'Please sign in to continue.', type: 'error' })
                      return
                    }
                    toggleModal(invertedProjectSlug)
                  }}
                >
                  <PackagePlus className="w-[20px] h-[20px] stroke-zinc-500 hover:stroke-emerald-400" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">Add project</TooltipContent>
            </Tooltip>
          </>
        )}
        {!isInverted && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => toggleModal(roleModalSlug)}
                className="bg-none p-0 border-0 cursor-pointer flex items-center"
              >
                <UserCheck className="stroke-zinc-500 hover:stroke-emerald-400 w-[20px] h-[20px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Filter users</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsInverted((prev) => !prev)}
              className="bg-none p-0 border-0 cursor-pointer"
            >
              {!isInverted ? (
                <ToggleLeft className={`stroke-zinc-800 transition-transform w-[24px] h-[24px]`} />
              ) : (
                <ToggleRight
                  className={`stroke-emerald-500 transition-transform w-[24px] h-[24px]`}
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Switch people/projects</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
