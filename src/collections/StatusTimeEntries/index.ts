import type { CollectionConfig } from 'payload'

import { statusOptions } from '@/collections/StatusTimeEntries/statusOptions'
import { authenticated } from '@/access/authenticated'
import { isAdminLevel } from '@/access/isAdmin'

export const StatusTimeEntries: CollectionConfig = {
  slug: 'status-time-entries',
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
      name: 'status',
      type: 'select',
      options: statusOptions,
    },
    {
      name: 'comment',
      type: 'text',
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
    },
  ],
}
