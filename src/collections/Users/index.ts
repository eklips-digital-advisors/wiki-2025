import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { isAdmin, isAdminLevel, isAdminOrEditorLevel } from '@/access/isAdmin'
import { isAdminOrSelfOrEditor } from '@/access/isAdminOrSelf'
import { revalidatePlanning } from '@/blocks/PlanningBlock/hooks/revalidatePlanning'
import { positionOptions } from '@/collections/Users/positionOptions'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: isAdmin,
    delete: isAdmin,
    read: authenticated,
    update: isAdminOrSelfOrEditor,
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
      options: ['user', 'editor', 'admin'],
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
      label: 'Profile image',
      name: 'media',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'position',
      type: 'select',
      options: positionOptions
    },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
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
          return isAdminOrEditorLevel(req.user)
        },
      },
    }
  ],
  timestamps: true,
  hooks: {
    afterChange: [revalidatePlanning]
  }
}
