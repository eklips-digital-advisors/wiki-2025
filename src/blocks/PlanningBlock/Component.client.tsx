'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Project, StatusTimeEntry, TimeEntry, User } from '@/payload-types'
import FullCalendar from '@fullcalendar/react'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import interactionPlugin from '@fullcalendar/interaction'
import './index.scss'
import '@payloadcms/ui/css'
import { useModal } from '@faceless-ui/modal'
import { ArrowDownNarrowWide, PackagePlus, ToggleLeft, ToggleRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Tooltip from '@/components/Tooltip'
import { onCalendarDateClick } from '@/blocks/PlanningBlock/utils/regular/onCalendarDateClick'
import { Toast } from '@/components/Toast'
import { getFrontendUser } from '@/utilities/getFrontendUser'
import { calculateUserWeeklyLoads, createUserWeeklySummaryEvents } from '@/blocks/PlanningBlock/utils/regular/calculateUserLoads'
import { generateResources } from '@/blocks/PlanningBlock/utils/regular/generateResources'
import { getLabel } from '@/utilities/getLabel'
import { generateInvertedResources } from '@/blocks/PlanningBlock/utils/inverted/generateInvertedResources'
import { onCalendarDateClickInverted } from '@/blocks/PlanningBlock/utils/inverted/onCalendarDateClickInverted'
import { statusOptions } from '@/collections/StatusTimeEntries/statusOptions'
import { StatusModal } from '@/blocks/PlanningBlock/modals/StatusModal'
import { HoursModal } from '@/blocks/PlanningBlock/modals/HoursModal'
import { ProjectModal } from '@/blocks/PlanningBlock/modals/ProjectModal'
import { getResourceLabelContent } from '@/blocks/PlanningBlock/utils/getResourceLabelContent'
import { getEventBg } from '@/blocks/PlanningBlock/utils/getEventBg'
import { handleResizeClick } from '@/blocks/PlanningBlock/utils/regular/handleResizeClick'
import { handleResizeClickInverted } from '@/blocks/PlanningBlock/utils/inverted/handleResizeClickInverted'
import { InvertedProjectModal } from '@/blocks/PlanningBlock/modals/InvertedProjectModal'

export const PlanningComponentClient: React.FC<{
  users: User[]
  projects: Project[]
  timeEntries: TimeEntry[]
  statusTimeEntries: StatusTimeEntry[]
  teamworkEvents: any[]
}> = ({ users, projects, timeEntries, statusTimeEntries, teamworkEvents }) => {
  const router = useRouter()
  const [usersState, setUsersState] = useState<User[]>(users)
  const [projectsState, setProjectsState] = useState<Project[]>(projects)
  const [timeEntriesState, setTimeEntriesState] = useState<TimeEntry[]>(timeEntries)
  const [statusTimeEntriesState, setStatusTimeEntriesState] = useState<StatusTimeEntry[]>(statusTimeEntries)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<any | null>(null)
  const modalSlug = 'project-modal-selection'
  const invertedProjectSlug = 'inverted-project-modal'
  const { toggleModal } = useModal()
  const [hoursInput, setHoursInput] = useState('')
  const [statusInput, setStatusInput] = useState(statusOptions[0].value)
  const [clickedInfo, setClickedInfo] = useState<any>(null)
  const hoursModalSlug = 'hours-entry-modal'
  const statusModalSlug = 'status-entry-modal'
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [isInverted, setIsInverted] = useState(false)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    getFrontendUser().then(setLoggedUser)
  }, []);

  const userWeeklyLoads = useMemo(() => calculateUserWeeklyLoads(timeEntriesState), [timeEntriesState])
  const userSummaryEvents = useMemo(() => createUserWeeklySummaryEvents(userWeeklyLoads), [userWeeklyLoads])
  const resources = useMemo(() => {
    return isInverted
      ? generateInvertedResources(usersState, projectsState, statusTimeEntriesState, sortDirection)
      : generateResources(usersState)
  }, [usersState, projectsState, isInverted, statusTimeEntriesState, sortDirection])

  const handleCalendarClick = async (info: any) => {
    if (!loggedUser) {
      setToast({ message: 'Please log in first', type: 'error' })
      return
    }

    await (
      !isInverted
        ? onCalendarDateClick({
          info,
          setClickedInfo,
          setHoursInput,
          toggleModal,
          modalSlug: hoursModalSlug,
          setToast,
          loggedUser,
        })
        : onCalendarDateClickInverted({
          info,
          setClickedInfo,
          setStatusInput,
          toggleModal,
          modalSlug: statusModalSlug,
          setToast,
          loggedUser,
        })
    );
  }

  const projectEvents = (timeEntriesState || []).flatMap((entry: any) => {
    const startDate = new Date(entry.start)
    const endDate = new Date(entry.end)

    return {
      id: `${entry.id}-${entry.user.id}`,
      resourceId: `project-${entry.project.id}-${entry.user.id}`,
      title: `${entry.hours}h`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    }
  })

  const invertedEvents = (statusTimeEntriesState || []).flatMap((entry: any) => {
    const startDate = new Date(entry.start)
    const endDate = new Date(entry.end)

    return {
      id: `${entry.id}`,
      resourceId: `${entry.project.id}`,
      title: `${getLabel(entry.status, statusOptions)}`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    }
  })
  
  const projectEventsInverted = (timeEntriesState || []).flatMap((entry: any) => {
    const startDate = new Date(entry.start)
    const endDate = new Date(entry.end)

    return {
      id: `${entry.id}-${entry.user.id}`,
      resourceId: `user-${entry.user.id}-${entry.project.id}`,
      title: `${entry.hours}h`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    }
  })

  const teamworkEventsForInverted = (teamworkEvents || []).flatMap((entry: any) => {
    const startDate = new Date(entry.start)
    const endDate = new Date(entry.end)

    return {
      id: `${entry.id}`,
      resourceId: entry.title.toLowerCase().includes('vacation') ? 'eklips-vacation' : 'eklips-internal',
      title: entry.title || 'Untitled Event',
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      type: entry.title.toLowerCase().includes('vacation') ? 'vacation default' : 'default',
    }
  })

  const events = useMemo(() => {
    return isInverted ? [...invertedEvents, ...projectEventsInverted, ...teamworkEventsForInverted] : [...projectEvents, ...userSummaryEvents]
  }, [isInverted, invertedEvents, projectEvents, userSummaryEvents])

  return (
    <>
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialView="resourceTimelineThreeMonths"
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        timeZone="UTC"
        firstDay={1}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right:
            'resourceTimelineMonth,resourceTimelineThreeMonths,resourceTimelineSixMonths',
        }}
        resources={resources}
        resourcesInitiallyExpanded={false}
        resourceOrder="position"
        resourceAreaHeaderContent={() => (
          <div className="flex justify-between gap-2 items-center w-full">
            <span className="inline-flex gap-2 items-center">
              <span className="font-medium text-lg">{`${isInverted ? 'Projects' : 'People'}`}</span>
              <span className="text-xs leading-3 rounded-2xl bg-zinc-100 p-1">{`${isInverted ? resources?.filter((item: any) => item.projectImage || item.projectImage === "").length : usersState?.length}`}</span>
            </span>
            <div className="flex gap-2">
              {isInverted && (
                <>
                  <span
                    className="text-xs cursor-pointer flex items-center"
                    onClick={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
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
                  onClick={() => setIsInverted(prev => !prev)}
                  className="bg-none p-0 border-0 cursor-pointer"
                >
                  {!isInverted
                    ? <ToggleLeft className={`stroke-zinc-800 transition-transform w-[24px] h-[24px]`} />
                    : <ToggleRight className={`stroke-emerald-500 transition-transform w-[24px] h-[24px]`} />
                  }
                </button>
              </Tooltip>
            </div>
          </div>
        )}
        events={events}
        eventDidMount={(info) => {
          const { start, end, title } = info.event;

          // Format dates
          const startDate = start?.toLocaleDateString('et-ET', { timeZone: 'Europe/Tallinn' });
          const endDate = end ? end.toLocaleDateString('et-ET', { timeZone: 'Europe/Tallinn' }) : null;

          // Build tooltip text
          const tooltipText = `${title}\nStart: ${startDate}${endDate ? `\nEnd: ${endDate}` : ''}`;

          // Set tooltip
          info.el.setAttribute('title', tooltipText);
        }}
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
            <div className={`flex items-center justify-center ${getEventBg(arg, isInverted)}`}>
              <span className={`${isInverted ? 'text-[14px]' : 'text-[16px]'} z-10 truncate`}>{arg.event.title}</span>
            </div>
          )
        }}
        editable={true}
        eventClick={handleCalendarClick}
        eventOverlap={false}
        selectable={true}
        select={handleCalendarClick}
        eventDrop={async (info) => {
          if (isInverted) {
            await handleResizeClickInverted(info, router, setStatusTimeEntriesState, loggedUser, setToast)
          } else {
            await handleResizeClick(info, router, setTimeEntriesState, loggedUser, setToast)
          }
        }}
        eventResize={async (info) => {
          if (isInverted) {
            await handleResizeClickInverted(info, router, setStatusTimeEntriesState, loggedUser, setToast)
          } else {
            await handleResizeClick(info, router, setTimeEntriesState, loggedUser, setToast)
          }
        }}
        selectOverlap={false}
        height="auto"
        slotDuration={{ weeks: 1 }}
        slotLabelFormat={[
          { month: 'long' }, // "9" for the date
          { week: 'numeric' }, // "S" for Sunday
        ]}
        views={{
          resourceTimelineThreeMonths: {
            type: 'resourceTimeline',
            duration: { weeks: 12 },
            slotDuration: { weeks: 1 },
          },
          resourceTimelineSixMonths: {
            type: 'resourceTimeline',
            duration: { months: 6 },
            slotDuration: { weeks: 1 },
          },
        }}
        buttonText={{
          resourceTimelineThreeMonths: '3 months',
          resourceTimelineSixMonths: '6 months',
        }}
        resourceLabelContent={getResourceLabelContent({
          isInverted,
          loggedUser,
          setSelectedResource,
          toggleModal,
          modalSlug,
          setUsersState,
          router,
          setToast,
          setProjectsState
        })}
      />

      <ProjectModal
        modalSlug={modalSlug} selectedResource={selectedResource} projectsState={projectsState} selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId} setSelectedResource={setSelectedResource} setUsersState={setUsersState}
        router={router} setToast={setToast} toggleModal={toggleModal} loggedUser={loggedUser}
      />

      <InvertedProjectModal
        modalSlug={invertedProjectSlug} projectsState={projectsState} selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId} setProjectsState={setProjectsState}
        router={router} setToast={setToast} toggleModal={toggleModal} loggedUser={loggedUser}
      />

      <HoursModal
        hoursModalSlug={hoursModalSlug} hoursInput={hoursInput} setHoursInput={setHoursInput} clickedInfo={clickedInfo}
        router={router} setTimeEntriesState={setTimeEntriesState} setToast={setToast} toggleModal={toggleModal}
      />

      <StatusModal
        statusModalSlug={statusModalSlug} statusInput={statusInput} setStatusInput={setStatusInput} clickedInfo={clickedInfo}
        router={router} setStatusTimeEntriesState={setStatusTimeEntriesState} setToast={setToast} toggleModal={toggleModal}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
