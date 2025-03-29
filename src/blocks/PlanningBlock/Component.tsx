import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PlanningComponentClient } from '@/blocks/PlanningBlock/Component.client'
import { ModalProvider } from '@faceless-ui/modal'

export const PlanningBlock: React.FC = async () => {
  const payload = await getPayload({ config: configPromise })

  const users = await payload.find({
    collection: 'users',
    limit: 100,
    where: {
      includeInPlanningTool: {
        equals: true,
      }
    },
    sort: 'position',
  })

  const projects = await payload.find({
    collection: 'projects',
    limit: 1000,
    // select: {
    //   title: true,
    //   id: true,
    // }
  });

  const timeEntries = await payload.find({
    collection: 'time-entries',
    limit: 9999,
  });

  const statusTimeEntries = await payload.find({
    collection: 'status-time-entries',
    limit: 9999,
  });

  return (
    <ModalProvider>
      <PlanningComponentClient users={users?.docs} projects={projects.docs} timeEntries={timeEntries.docs} statusTimeEntries={statusTimeEntries.docs} />
    </ModalProvider>
  )
}
