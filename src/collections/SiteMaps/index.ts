import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const SiteMaps: CollectionConfig = {
  slug: 'site-maps',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'createdAt'],
  },
  labels: {
    plural: 'Sitemaps',
    singular: 'Sitemap',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'graph',
      label: 'Sitemap',
      type: 'json',
      defaultValue: { nodes: [], edges: [] },
      admin: {
        description: 'Build your page tree. Use "+ Main page" or select a node and "+ Child".',
        components: {
          Field: '@/collections/SiteMaps/component/getAdminComponent#GetAdminComponent',
        },
      },
    },
  ],
}
