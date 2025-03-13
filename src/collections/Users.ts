import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/utilities/isAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      admin: {
        position: 'sidebar',
      },
      name: 'role',
      type: 'select',
      defaultValue: ['user'],
      options: ['user', 'admin'],
      // access: {
      //   update: ({ req }) => {
      //     return isAdmin(req.user)
      //   },
      // },
    },
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}
