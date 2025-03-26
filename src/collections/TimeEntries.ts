import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const TimeEntries: CollectionConfig = {
  slug: 'time-entries',
  access: {
    create: isAdminOrSelf,
    delete: isAdminOrSelf,
    read: anyone,
    update: isAdminOrSelf,
  },
  admin: {
    useAsTitle: 'week',
  },
  // defaultPopulate: {
  //   date: true,
  //   hours: true,
  //   user: true,
  //   project: true,
  // },
  fields: [
    {
      name: 'week',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      // required: true,
      // hooks: {
      //   beforeValidate: [
      //     ({ value }) => {
      //       if (value && typeof value === 'string') {
      //         const date = new Date(value);
      //         date.setUTCHours(0, 0, 0, 0);
      //         return date.toISOString();
      //       }
      //       return value;
      //     },
      //   ],
      // },
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
