import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'
import { revalidatePlanning } from '@/blocks/PlanningBlock/hooks/revalidatePlanning'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  // defaultPopulate: {
  //   title: true,
  //   users: true,
  //   timeEntries: true,
  // },
  fields: [
    {
      name: 'setTitle',
      type: 'ui',
      admin: {
        disableListColumn: true,
        components: {
          Field: '@/collections/Projects/AdminTitle#AdminTitle',
        }
      }
    },
    {
      name: 'projectTeamwork',
      type: 'text',
      // required: true,
      admin: {
        components: {
          Field: '@/utilities/GetTeamwork/getProjects#GetProjects',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        condition: (_, siblingData) => !siblingData.projectTeamwork,
        description: 'Set manually if no project in TW'
      }
    },
    {
      name: 'image',
      type: 'text',
    },
    {
      name: 'showInProjectView',
      type: 'checkbox',
    },
    {
      name: 'users',
      type: 'join',
      collection: 'users',
      on: 'projects',
    },
    {
      name: 'timeEntries',
      type: 'join',
      collection: 'time-entries',
      on: 'project',
    },
    {
      name: 'statusTimeEntries',
      type: 'join',
      collection: 'status-time-entries',
      on: 'project',
    },
  ],
  hooks: {
    afterChange: [revalidatePlanning],
  },
}
