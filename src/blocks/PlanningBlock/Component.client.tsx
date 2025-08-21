'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Project, StatusTimeEntry, TimeEntry, User } from '@/payload-types'
import FullCalendar from '@fullcalendar/react'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import interactionPlugin from '@fullcalendar/interaction'
import './index.scss'
import '@payloadcms/ui/css'
import { useModal } from '@faceless-ui/modal'
import { useRouter } from 'next/navigation'
import { onCalendarDateClick } from '@/blocks/PlanningBlock/utils/regular/onCalendarDateClick'
import { Toast } from '@/components/Toast'
import { getFrontendUser } from '@/utilities/getFrontendUser'
import { calculateUserWeeklyLoads, createUserWeeklySummaryEvents } from '@/blocks/PlanningBlock/utils/regular/calculateUserLoads'
import { generateResources } from '@/blocks/PlanningBlock/utils/regular/generateResources'
import { generateInvertedResources } from '@/blocks/PlanningBlock/utils/inverted/generateInvertedResources'
import {
  onCalendarProjectDateClickInverted,
} from '@/blocks/PlanningBlock/utils/inverted/onCalendarProjectDateClickInverted'
import { statusOptions } from '@/collections/StatusTimeEntries/statusOptions'
import { StatusModal } from '@/blocks/PlanningBlock/modals/StatusModal'
import { HoursModal } from '@/blocks/PlanningBlock/modals/HoursModal'
import { ProjectModal } from '@/blocks/PlanningBlock/modals/ProjectModal'
import { getResourceLabelContent } from '@/blocks/PlanningBlock/utils/getResourceLabelContent'
import { getEventBg } from '@/blocks/PlanningBlock/utils/getEventBg'
import { handleResizeClick } from '@/blocks/PlanningBlock/utils/regular/handleResizeClick'
import { handleResizeClickInverted } from '@/blocks/PlanningBlock/utils/inverted/handleResizeClickInverted'
import { InvertedProjectModal } from '@/blocks/PlanningBlock/modals/InvertedProjectModal'
import { onCalendarUserDateClickInverted } from '@/blocks/PlanningBlock/utils/inverted/onCalendarUserDateClickInverted'
import { InvertedHoursModal } from '@/blocks/PlanningBlock/modals/InvertedHoursModal'
import {
  getInvertedEvents,
  getProjectEventsInverted,
  getTeamworkEventsForInverted,
} from '@/blocks/PlanningBlock/utils/inverted/eventsInverted'
import { getProjectEvents } from '@/blocks/PlanningBlock/utils/regular/events'
import { ResourceAreaHeaderContent } from '@/blocks/PlanningBlock/ResourceAreaHeaderContent'
import { Info } from 'lucide-react'
import { RoleFilterModal } from '@/blocks/PlanningBlock/modals/RoleFilterModal'
import { ProjectCommentModal } from '@/blocks/PlanningBlock/modals/ProjectCommentModal'

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
  const [statusComment, setStatusComment] = useState('')
  const [projectComment, setProjectComment] = useState('')
  const [clickedInfo, setClickedInfo] = useState<any>(null)
  const hoursModalSlug = 'hours-entry-modal'
  const invertedHoursModalSlug = 'inverted-hours-entry-modal'
  const statusModalSlug = 'status-entry-modal'
  const projectCommentModalSlug = 'project-comment-modal'
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [isInverted, setIsInverted] = useState(false)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [invertedShowAllProjects, setInvertedShowAllProjects] = useState(false)

  const allRoles = useMemo(() => {
    const roles = usersState.map((user) => user.position).filter(Boolean) as string[];
    return Array.from(new Set(roles));
  }, [usersState]);

  useEffect(() => {
    getFrontendUser().then(setLoggedUser)
    setSelectedRoles(allRoles);
  }, [allRoles]);

  const filteredUsers = useMemo(() => {
    return usersState.filter((user) => selectedRoles.includes(user.position ?? ''));
  }, [usersState, selectedRoles]);

  const userWeeklyLoads = useMemo(() => calculateUserWeeklyLoads(timeEntriesState), [timeEntriesState])
  const userSummaryEvents = useMemo(() => createUserWeeklySummaryEvents(userWeeklyLoads), [userWeeklyLoads])
  const resources = useMemo(() => {
    return isInverted
      ? generateInvertedResources(usersState, projectsState, statusTimeEntriesState, sortDirection, invertedShowAllProjects)
      : generateResources(filteredUsers)
  }, [usersState, filteredUsers, projectsState, isInverted, statusTimeEntriesState, sortDirection, invertedShowAllProjects])

  const handleCalendarClick = async (info: any) => {
    if (!loggedUser) {
      setToast({ message: 'Please log in first', type: 'error' })
      return
    }

    if (isInverted) {
      const resourceId = info.resource?.id ?? info.event?.getResources?.()[0]?.id
      const isUserClick = resourceId?.startsWith('user-')

      if (isUserClick) {
        await onCalendarUserDateClickInverted({ info, setClickedInfo, setHoursInput, toggleModal, modalSlug: invertedHoursModalSlug,
          setToast, loggedUser,
        })
      } else {
        await onCalendarProjectDateClickInverted({ info, setClickedInfo, setStatusInput, setStatusComment,
          toggleModal, modalSlug: statusModalSlug, setToast, loggedUser,
        })
      }
    } else {
      await onCalendarDateClick({ info, setClickedInfo, setHoursInput, toggleModal, modalSlug: hoursModalSlug, setToast, loggedUser, })
    }
  }

  const allowFn = () => {
    if (!loggedUser) {
      setToast({ message: 'Please log in', type: 'error' })
      return false
    }
    return true
  }

  const projectEvents = useMemo(() => getProjectEvents(timeEntriesState), [timeEntriesState])
  const invertedEvents = useMemo(() => getInvertedEvents(statusTimeEntriesState), [statusTimeEntriesState])
  const projectEventsInverted = useMemo(() => getProjectEventsInverted(timeEntriesState), [timeEntriesState])
  const teamworkEventsForInverted = useMemo(() => getTeamworkEventsForInverted(teamworkEvents), [teamworkEvents])

  const events = useMemo(() => {
    return isInverted ? [...invertedEvents, ...projectEventsInverted, ...teamworkEventsForInverted] : [...projectEvents, ...userSummaryEvents]
  }, [isInverted, invertedEvents, projectEvents, userSummaryEvents, projectEventsInverted, teamworkEventsForInverted])

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
          <ResourceAreaHeaderContent isInverted={isInverted} setIsInverted={setIsInverted} sortDirection={sortDirection}
            setSortDirection={setSortDirection} resources={resources} usersState={usersState} loggedUser={loggedUser}
            setToast={setToast} toggleModal={toggleModal} invertedProjectSlug={invertedProjectSlug}
            invertedShowAllProjects={invertedShowAllProjects} setInvertedShowAllProjects={setInvertedShowAllProjects}
          />
        )}
        events={events}
        eventDidMount={(info) => {
          const { start, end, title } = info.event;
          const comment = info?.event?.extendedProps?.comment || null;
          const startDate = start?.toLocaleDateString('et-ET', { timeZone: 'Europe/Tallinn' });
          const endDate = end ? end.toLocaleDateString('et-ET', { timeZone: 'Europe/Tallinn' }) : null;
          let tooltipText = `${title}\nStart: ${startDate}${endDate ? `\nEnd: ${endDate}` : ''}`;
          if (comment) {
            tooltipText += `\nComment: ${comment}`;
          }

          info.el.setAttribute('title', tooltipText);
        }}
        resourceLabelDidMount={(arg) => {
          const resourceType = arg.resource.extendedProps?.type;
          const projectType = arg?.resource?._resource?.extendedProps?.projectType;
          const showInProjectView = arg?.resource?._resource?.extendedProps?.showInProjectView;
          const isProject = arg?.resource?._resource?.extendedProps?.isProject;
          const resourceId = arg?.resource?.id;
          const timelineRow = document.querySelector(`.fc-timeline-body td[data-resource-id="${resourceId}"]`) as HTMLElement;

          if (!isInverted) {
            const position = arg?.resource?.extendedProps?.position
            if (position?.includes('pm') && timelineRow) {
              timelineRow.style.setProperty('--overload-success', '#c6d2ff');
            } else if (position?.includes('designer') && timelineRow) {
              timelineRow.style.setProperty('--overload-success', '#fee685');
            }
          }

          if (isInverted && resourceType === 'non-teamwork-project') {
            if (timelineRow) {
              timelineRow.classList.add('non-teamwork-project');
            }
          }

          if (isProject && !showInProjectView) {
            if (timelineRow) {
              timelineRow.classList.add('archived');
            }
          }

          if (projectType === 'vacation') {
            if (timelineRow) {
              timelineRow.classList.add('vacation');
            }
          }
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
                <span className="text-[16px] z-10 font-medium">{arg.event.title}</span>
              </div>
            )
          }

          return (
            <div className={`flex items-center justify-center rounded-md ${getEventBg(arg, isInverted)}`}>
              <span className={`${!arg.event.getResources()?.[0]?._resource?.extendedProps?.isProject ? 'text-[12px]' : 'text-[14px]'} z-10 truncate`}>
                {arg.event.title}
              </span>
              {isInverted && arg?.event?.extendedProps?.comment &&
                <div className="absolute right-[4px] top-[2px]">
                  <Info className="w-3 h-3 stroke-zinc-800" />
                </div>
              }
            </div>
          )
        }}
        editable={true}
        eventClick={handleCalendarClick}
        eventOverlap={false}
        selectable={true}
        select={handleCalendarClick}
        eventAllow={allowFn}
        selectAllow={allowFn}
        eventDrop={async (info) => {
          if (isInverted) {
            await handleResizeClickInverted(info, router, setStatusTimeEntriesState, loggedUser, setToast, setTimeEntriesState)
          } else {
            await handleResizeClick(info, router, setTimeEntriesState, loggedUser, setToast)
          }
        }}
        eventResize={async (info) => {
          if (isInverted) {
            await handleResizeClickInverted(info, router, setStatusTimeEntriesState, loggedUser, setToast, setTimeEntriesState)
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
        resourceLabelContent={getResourceLabelContent({ isInverted, loggedUser, setSelectedResource, toggleModal,
          modalSlug, setUsersState, router, setToast, setProjectsState, setProjectComment
        })}
      />

      <ProjectModal
        modalSlug={modalSlug} selectedResource={selectedResource} projectsState={projectsState} selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId} setSelectedResource={setSelectedResource} setUsersState={setUsersState}
        router={router} setToast={setToast} toggleModal={toggleModal} loggedUser={loggedUser}
      />

      <ProjectCommentModal
        modalSlug={projectCommentModalSlug} selectedResource={selectedResource} setUsersState={setUsersState}
        router={router} setToast={setToast} toggleModal={toggleModal} loggedUser={loggedUser} projectComment={projectComment}
        setProjectComment={setProjectComment} setProjectsState={setProjectsState}
      />

      <InvertedProjectModal
        modalSlug={invertedProjectSlug} projectsState={projectsState} selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId} setProjectsState={setProjectsState}
        router={router} setToast={setToast} toggleModal={toggleModal} loggedUser={loggedUser}
      />

      <InvertedHoursModal
        hoursModalSlug={invertedHoursModalSlug} hoursInput={hoursInput} setHoursInput={setHoursInput} clickedInfo={clickedInfo}
        router={router} setTimeEntriesState={setTimeEntriesState} setToast={setToast} toggleModal={toggleModal}
      />

      <HoursModal
        hoursModalSlug={hoursModalSlug} hoursInput={hoursInput} setHoursInput={setHoursInput} clickedInfo={clickedInfo}
        router={router} setTimeEntriesState={setTimeEntriesState} setToast={setToast} toggleModal={toggleModal}
      />

      <StatusModal
        statusModalSlug={statusModalSlug} statusInput={statusInput} setStatusInput={setStatusInput} statusComment={statusComment}
        setStatusComment={setStatusComment} clickedInfo={clickedInfo} router={router}
        setStatusTimeEntriesState={setStatusTimeEntriesState} setToast={setToast} toggleModal={toggleModal}
      />

      <RoleFilterModal
        modalSlug="role-filter-modal"
        allRoles={allRoles}
        selectedRoles={selectedRoles}
        setSelectedRoles={setSelectedRoles}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
