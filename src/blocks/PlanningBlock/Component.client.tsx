'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Project, TimeEntry, User } from '@/payload-types'
import FullCalendar from '@fullcalendar/react'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import interactionPlugin from '@fullcalendar/interaction'
import './index.scss'
import '@payloadcms/ui/css'
import { Button } from '@/components/ui/button'
import { SelectInput } from '@payloadcms/ui'
import { useModal, Modal, ModalToggler, ModalContainer } from '@faceless-ui/modal'
import { ArrowRightLeft, CircleX, PackagePlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { handleAddProject } from '@/blocks/PlanningBlock/utils/handleAddProject'
import { handleRemoveProject } from '@/blocks/PlanningBlock/utils/handleRemoveProject'
import Tooltip from '@/components/Tooltip'
import { onCalendarDateClick } from '@/blocks/PlanningBlock/utils/onCalendarDateClick'
import { handleSaveDateClick } from '@/blocks/PlanningBlock/utils/handleSaveDateClick'
import { handleDeleteDateClick } from '@/blocks/PlanningBlock/utils/handleDeleteDateClick'
import { Toast } from '@/components/Toast'
import { ProfileImage } from '@/blocks/PlanningBlock/ProfileImage'
import { getFrontendUser } from '@/utilities/getFrontendUser'
import { calculateUserWeeklyLoads, createUserWeeklySummaryEvents } from '@/blocks/PlanningBlock/utils/calculateUserLoads'
import { generateResources } from '@/blocks/PlanningBlock/utils/generateResources'
import { getLabel } from '@/utilities/getLabel'
import { positionOptions } from '@/collections/Users/positionOptions'
import { generateInvertedResources } from '@/blocks/PlanningBlock/utils/generateInvertedResources'

export const PlanningComponentClient: React.FC<{
  users: User[]
  projects: Project[]
  timeEntries: TimeEntry[]
}> = ({ users, projects, timeEntries }) => {
  const router = useRouter()
  const [usersState, setUsersState] = useState<User[]>(users)
  const [projectsState] = useState<Project[]>(projects)
  const [timeEntriesState, setTimeEntriesState] = useState<TimeEntry[]>(timeEntries)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<any | null>(null)
  const modalSlug = 'project-modal-selection'
  const { toggleModal } = useModal()
  const [hoursInput, setHoursInput] = useState('')
  const [clickedInfo, setClickedInfo] = useState<any>(null)
  const hoursModalSlug = 'hours-entry-modal'
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [isInverted, setIsInverted] = useState(false)

  // console.log('timeEntriesState', timeEntriesState)

  useEffect(() => {
    getFrontendUser().then(setLoggedUser)
  }, []);

  const userWeeklyLoads = useMemo(() => calculateUserWeeklyLoads(timeEntriesState), [timeEntriesState])
  const userSummaryEvents = useMemo(() => createUserWeeklySummaryEvents(userWeeklyLoads), [userWeeklyLoads])
  const resources = useMemo(() => {
    return isInverted
      ? generateInvertedResources(usersState, projectsState)
      : generateResources(usersState)
  }, [usersState, projectsState, isInverted])

  const handleCalendarClick = async (info: any) => {
    if (!loggedUser) {
      setToast({ message: 'Please log in first', type: 'error' })
      return
    }

    await onCalendarDateClick({
      info,
      setClickedInfo,
      setHoursInput,
      toggleModal,
      modalSlug: hoursModalSlug,
      setToast,
      loggedUser,
    })
  }

  const projectEvents = (timeEntriesState || []).flatMap((entry: any) => {
    const startDate = new Date(entry.date) // Already normalized to Monday
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) // +7 days

    return {
      id: `${entry.id}-${entry.user.id}`,
      resourceId: `project-${entry.project.id}-${entry.user.id}`,
      title: `${entry.hours}h`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    }
  })

  const events = [...projectEvents, ...userSummaryEvents]

  return (
    <>
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialView="resourceTimelineEightWeeks"
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        timeZone="UTC"
        firstDay={1}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right:
            'resourceTimelineMonth,resourceTimelineEightWeeks,resourceTimelineSixMonths',
        }}
        resources={resources}
        resourcesInitiallyExpanded={false}
        resourceOrder="position"
        resourceAreaHeaderContent={() => (
          <div className="flex justify-between gap-2 items-center w-full">
            <span><span className="font-medium">Resources</span> <span className="font-normal">{`${isInverted ? '(projects)' : '(users)'}`}</span></span>
            <Tooltip content="Revert users/projects" position="left">
              <button
                onClick={() => setIsInverted(prev => !prev)}
                className="bg-none p-0 border-0 cursor-pointer"
              >
                <ArrowRightLeft className="w-[20px] h-[20px] stroke-zinc-800 hover:stroke-zinc-700" />
              </button>
            </Tooltip>
          </div>
        )}
        events={events}
        eventContent={(arg) => {
          const { isSummary, bgColorSummary, heightPercentSummary } = arg.event.extendedProps

          if (isSummary) {
            return (
              <div className="h-[48px] flex items-center justify-center">
                <span className={`load-indicator inline-block h-[56px] absolute`}>
                  <span
                    className={`absolute left-0 right-0 bottom-0 w-full rounded-md ${bgColorSummary}`}
                    style={{ height: `${heightPercentSummary}%` }}
                  />
                </span>
                <span className="text-[16px] z-10">{arg.event.title}</span>
              </div>
            )
          }

          return (
            <div className="h-[40px] flex items-center justify-center">
              <span className="text-[16px] z-10">{arg.event.title}</span>
            </div>
          )
        }}
        editable={true}
        eventResizableFromStart={false}
        eventDurationEditable={false}
        eventClick={handleCalendarClick}
        dateClick={handleCalendarClick}
        droppable={false}
        height="auto"
        slotDuration={{ weeks: 1 }}
        slotLabelFormat={[
          { month: 'long' }, // "9" for the date
          { week: 'numeric' }, // "S" for Sunday
        ]}
        views={{
          resourceTimelineEightWeeks: {
            type: 'resourceTimeline',
            duration: { weeks: 8 }, // you can change to any number of weeks
            slotDuration: { weeks: 1 },
          },
          resourceTimelineSixMonths: {
            type: 'resourceTimeline',
            duration: { months: 6 },
            slotDuration: { weeks: 1 },
          },
        }}
        buttonText={{
          resourceTimelineEightWeeks: '2 months',
          resourceTimelineSixMonths: '6 months',
        }}
        resourceLabelContent={(arg) => {
          if (!arg.resource._resource.parentId) {
            return (
              <div className="flex justify-between gap-2 items-center">
                <div className="flex gap-2 items-center ml-2">
                  <ProfileImage
                    name={arg?.resource?._resource?.title}
                    url={arg?.resource?._resource?.extendedProps?.profileImage || arg?.resource?._resource?.extendedProps?.projectImage}
                    variant={isInverted ? 'square' : 'rounded'}
                  />
                  <span className="flex flex-col gap-1">
                    <span className="leading-4">{arg.resource.title}</span>
                    <span className="text-[12px] leading-3">{getLabel(arg?.resource?._resource?.extendedProps?.position, positionOptions)}</span>
                  </span>
                </div>
                {!isInverted &&
                  <div
                    title="Add project"
                    className="text-xs cursor-pointer flex items-center"
                    onClick={() => {
                      if (!loggedUser) {
                        setToast({ message: 'Please log in first', type: 'error' })
                        return
                      }

                      setSelectedResource(arg.resource)
                      toggleModal(modalSlug) // Open modal manually
                    }}
                  >
                    <Tooltip content="Add project" position="left">
                      <PackagePlus className="w-[20px] h-[20px] stroke-emerald-400 hover:stroke-emerald-300" />
                    </Tooltip>
                  </div>
                }
              </div>
            )
          } else {
            return (
              <div className="flex justify-between gap-2">
                <div className="flex gap-2 items-center ml-2">
                  {arg.resource.title}
                  <ProfileImage
                    name={arg?.resource?._resource?.title}
                    url={arg?.resource?._resource?.extendedProps?.projectImage || arg?.resource?._resource?.extendedProps?.profileImage}
                    size={20}
                    variant={!isInverted ? 'square' : 'rounded'}
                  />
                </div>
                {arg.resource.title && !isInverted &&
                  <Button
                    className="p-0 cursor-pointer"
                    variant="link"
                    title="Remove project"
                    onClick={() => handleRemoveProject(arg?.resource, setUsersState, router, setToast, loggedUser)}
                  >
                    <Tooltip content="Remove project" position="left">
                      <CircleX className="w-[20px] h-[20px] stroke-zinc-400 hover:stroke-zinc-300" />
                    </Tooltip>
                  </Button>
                }
              </div>
            )
          }
        }}
      />

      <ModalContainer className="bg-zinc-800/10">
        <Modal
          className="bg-white p-4 w-100 rounded-md border border-zinc-200 left-1/2 top-1/2 -translate-1/2"
          slug={modalSlug}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalToggler className="absolute -right-2 -top-2 cursor-pointer" slug={modalSlug}>
            <CircleX className="w-5 h-5 fill-white" />
          </ModalToggler>
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold">Add new project to {selectedResource?._resource?.title}</h2>
            <SelectInput
              className="project-select"
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
                handleAddProject({
                  selectedProjectId,
                  selectedResource,
                  setSelectedProjectId,
                  setSelectedResource,
                  toggleModal,
                  setUsersState,
                  router,
                  modalSlug,
                  setToast,
                  loggedUser
                })
              }
            >
              Add
            </Button>
          </div>
        </Modal>
      </ModalContainer>

      <ModalContainer className="bg-zinc-800/10">
        <Modal
          className="bg-white p-4 w-100 rounded-md border border-zinc-200 left-1/2 top-1/2 -translate-1/2"
          slug={hoursModalSlug}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalToggler className="absolute -right-2 -top-2 cursor-pointer border-0 focus:border-0" slug={hoursModalSlug}>
            <CircleX className="w-5 h-5 fill-white hover:stroke-emerald-500" />
          </ModalToggler>
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold">Update hours</h2>
            <input
              type="number"
              className="border border-zinc-300 rounded px-2 py-1"
              placeholder="Enter hours"
              value={hoursInput}
              onChange={(e) => setHoursInput(e.target.value)}
            />
            <div className="flex gap-2 items-center flex-wrap">
              <Button
                variant="default"
                className="cursor-pointer self-start"
                onClick={async () => {
                  await handleSaveDateClick(clickedInfo, router, hoursInput, setTimeEntriesState)
                  setToast({ message: 'Hours saved', type: 'success' })
                  setHoursInput('')
                  toggleModal(hoursModalSlug)
                }}
              >
                Save
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer self-start"
                onClick={async () => {
                  await handleDeleteDateClick(clickedInfo, router, setTimeEntriesState)
                  setToast({ message: 'Entry deleted', type: 'success' })
                  setHoursInput('')
                  toggleModal(hoursModalSlug)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </ModalContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
