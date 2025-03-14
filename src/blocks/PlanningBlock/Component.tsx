import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PlanningComponentClient } from '@/blocks/PlanningBlock/Component.client'

export const PlanningBlock: React.FC = async () => {
  const payload = await getPayload({ config: configPromise })

  const users = await payload.find({
    collection: 'users',
    limit: 100,
    where: {
      includeInPlanningTool: {
        equals: true,
      }
    }
  })

  return (
    <PlanningComponentClient users={users?.docs} />
  )
}
