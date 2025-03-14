'use client'

import React from 'react'
import { User } from '@/payload-types'
import FullCalendar from '@fullcalendar/react'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import interactionPlugin from '@fullcalendar/interaction'

export const PlanningComponentClient: React.FC<{ users: User[] }> = ({ users }) => {
  
  // Convert users to FullCalendar resources
  const resources = users.map((user) => ({
    id: user.id,
    title: user.name || '',
  }))

  const events = [
    {
      id: '1',
      resourceId: users[0]?.id,
      title: 'Meeting',
      start: '2025-03-09T12:00:00Z', // Use a fixed date instead of `new Date()`
    },
  ]

  return (
    <FullCalendar
      plugins={[resourceTimelinePlugin, interactionPlugin]}
      initialView="resourceTimelineWeek"
      schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth',
      }}
      resources={resources}
      events={events}
      editable={true}
      droppable={true}
      height="auto"
    />
  )
}
