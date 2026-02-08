import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'
import { revalidatePlanning } from '@/blocks/PlanningBlock/hooks/revalidatePlanning'
import { priorityOptions } from '@/collections/Projects/priorityOptions'

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
    group: 'Planning',
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
      name: 'comment',
      type: 'text',
    },
    {
      name: 'pm',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      admin: {
        description: 'Project manager',
      },
      filterOptions: {
        position: {
          equals: 'pm',
        },
      },
    },
    {
      name: 'frontend',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      admin: {
        description: 'Frontend owner',
      },
      filterOptions: {
        position: {
          equals: 'frontend',
        },
      },
    },
    {
      name: 'backend',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      admin: {
        description: 'Backend owner',
      },
      filterOptions: {
        position: {
          equals: 'backend',
        },
      },
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'none',
      options: priorityOptions,
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
      name: 'type',
      type: 'select',
      options: [
        {
          label: 'Vacation',
          value: 'vacation',
        },
      ]
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
