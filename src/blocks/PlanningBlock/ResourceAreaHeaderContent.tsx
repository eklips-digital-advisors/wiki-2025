import Tooltip from '@/components/Tooltip'
import { ArrowDownNarrowWide, PackagePlus, ToggleLeft, ToggleRight } from 'lucide-react'
import React from 'react'
import { User } from '@/payload-types'

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
  invertedProjectSlug: string
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
}) => {
  return (
    <div className="flex justify-between gap-2 items-center w-full">
      <span className="inline-flex gap-2 items-center">
        <span className="font-medium text-lg">{`${isInverted ? 'Projects' : 'People'}`}</span>
        <span className="text-xs leading-3 rounded-2xl bg-zinc-100 p-1">{`${isInverted ? resources?.filter((item: any) => item.projectImage || item.projectImage === '').length : usersState?.length}`}</span>
      </span>
      <div className="flex gap-2">
        {isInverted && (
          <>
            <span
              className="text-xs cursor-pointer flex items-center"
              onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            >
              <Tooltip content="Sort based on launch date" position="left">
                <ArrowDownNarrowWide
                  className={`w-[20px] h-[20px] hover:stroke-emerald-400 transition-transform duration-200 ${sortDirection === 'desc' ? 'rotate-180 stroke-emerald-500' : 'rotate-0 stroke-zinc-500'}`}
                />
              </Tooltip>
            </span>
            <span
              className="text-xs cursor-pointer flex items-center mr-2"
              onClick={() => {
                if (!loggedUser) {
                  setToast({ message: 'Please log in first', type: 'error' })
                  return
                }
                toggleModal(invertedProjectSlug)
              }}
            >
              <Tooltip content="Add project" position="left">
                <PackagePlus className="w-[20px] h-[20px] stroke-zinc-500 hover:stroke-emerald-400" />
              </Tooltip>
            </span>
          </>
        )}
        <Tooltip content="Switch people/projects" position="left">
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
        </Tooltip>
      </div>
    </div>
  )
}
