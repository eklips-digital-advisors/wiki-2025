import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { isAdmin, isAdminLevel } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: isAdmin,
    delete: isAdmin,
    read: authenticated,
    update: isAdminOrSelf,
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
      defaultValue: 'user',
      options: ['user', 'admin'],
      access: {
        update: ({ req }) => {
          return isAdminLevel(req.user)
        },
      },
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'includeInPlanningTool',
      label: 'Include in Planning Tool',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
      access: {
        update: ({ req }) => {
          return isAdminLevel(req.user)
        },
      },
    }
  ],
  timestamps: true,
}
