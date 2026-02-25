import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { isAdminLevel } from '@/access/isAdmin'

export const TimeEntries: CollectionConfig = {
  slug: 'time-entries',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'start',
    group: 'Planning',
    hidden: ({ user }: { user: any }) => {
      return !isAdminLevel(user)
    },
  },
  // defaultPopulate: {
  //   date: true,
  //   hours: true,
  //   user: true,
  //   project: true,
  // },
  fields: [
    {
      name: 'start',
      type: 'date',
    },
    {
      name: 'end',
      type: 'date',
    },
    {
      name: 'hours',
      type: 'number',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
    },
  ],
}
