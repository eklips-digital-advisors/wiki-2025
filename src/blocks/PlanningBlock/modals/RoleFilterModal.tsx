import React from 'react'
import { Modal, ModalToggler, ModalContainer } from '@faceless-ui/modal'
import { CircleX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getLabel } from '@/utilities/getLabel'
import { positionOptions } from '@/collections/Users/positionOptions'

type Props = {
  modalSlug: string
  allRoles: string[]
  selectedRoles: string[]
  setSelectedRoles: React.Dispatch<React.SetStateAction<string[]>>
}

export const RoleFilterModal: React.FC<Props> = ({
  modalSlug,
  allRoles,
  selectedRoles,
  setSelectedRoles,
}) => {
  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    )
  }

  const selectAll = () => setSelectedRoles(allRoles)
  const deselectAll = () => setSelectedRoles([])

  return (
    <ModalContainer className="bg-zinc-800/10">
      <Modal
        slug={modalSlug}
        className="bg-white p-4 w-[320px] rounded-md border border-zinc-200 left-1/2 top-1/2 -translate-1/2"
        onClick={(e) => e.stopPropagation()}
        closeOnBlur={false}
      >
        <ModalToggler
          className="absolute -right-2 -top-2 cursor-pointer border-0 focus:border-0"
          slug={modalSlug}
        >
          <CircleX className="w-5 h-5 fill-white hover:stroke-emerald-500" />
        </ModalToggler>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Filter by Roles</h2>

          <div className="flex gap-2 text-xs">
            <Button variant="default" onClick={selectAll}>Select All</Button>
            <Button variant="default" onClick={deselectAll}>Deselect All</Button>
          </div>

          <fieldset className="space-y-2 mt-4">
            <legend className="sr-only">Roles</legend>
            {allRoles.map((role) => (
              <div key={role} className="flex gap-3">
                <div className="flex h-6 shrink-0 items-center">
                  <div className="group grid size-4 grid-cols-1">
                    <input
                      id={role}
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-zinc-600 checked:bg-zinc-600 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
                    />
                    <svg
                      fill="none"
                      viewBox="0 0 14 14"
                      className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white"
                    >
                      <path
                        d="M3 8L6 11L11 3.5"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-0 group-has-[:checked]:opacity-100"
                      />
                    </svg>
                  </div>
                </div>
                <label htmlFor={role} className="text-sm/6 font-medium text-gray-900">
                  {getLabel(role, positionOptions)}
                </label>
              </div>
            ))}
          </fieldset>
        </div>
      </Modal>
    </ModalContainer>
  )
}
