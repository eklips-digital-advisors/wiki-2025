import type { CollectionConfig } from 'payload'

import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { anyone } from '@/access/anyone'
import { statusOptions } from '@/collections/StatusTimeEntries/statusOptions'

export const StatusTimeEntries: CollectionConfig = {
  slug: 'status-time-entries',
  access: {
    create: isAdminOrSelf,
    delete: isAdminOrSelf,
    read: anyone,
    update: isAdminOrSelf,
  },
  admin: {
    useAsTitle: 'start',
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
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
    },
  ],
}
