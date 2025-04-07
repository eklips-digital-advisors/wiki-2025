import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { statusOptions } from '@/collections/StatusTimeEntries/statusOptions'
import { authenticated } from '@/access/authenticated'
import { isAdmin, isAdminLevel } from '@/access/isAdmin'

export const StatusTimeEntries: CollectionConfig = {
  slug: 'status-time-entries',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'start',
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
      options: statusOptions
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
