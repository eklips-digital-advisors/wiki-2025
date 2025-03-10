import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'

export const Sites: CollectionConfig<'sites'> = {
  slug: 'sites',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a site is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'sites'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'group',
      name: 'integrations',
      fields: [
        {
          name: 'repository',
          type: 'text',
          admin: {
            components: {
              Field: '@/utilities/GetRepos/getRepos#GetRepos',
            },
          },
        },
        {
          name: 'pingdom',
          type: 'text',
          admin: {
            components: {
              Field: '@/utilities/GetPingdomChecks/getPingdomChecks#GetPingdomChecks',
            },
          },
        },
        {
          name: 'cloudflare',
          type: 'text',
          admin: {
            components: {
              Field: '@/utilities/GetCloudflareItems/getAllCloudflareItems#GetAllCloudflareItems',
            },
          },
        },
      ],
    },
    {
      name: 'siteService',
      type: 'select',
      defaultValue: 'corporate',
      options: [
        {
          label: 'Corporate',
          value: 'corporate',
        },
        {
          label: 'Investor',
          value: 'investor',
        },
        {
          label: 'Transaction',
          value: 'transaction',
        },
        {
          label: 'Campaign',
          value: 'campaign',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },
    {
      name: 'hosting',
      type: 'select',
      options: [
        {
          label: 'Adminor',
          value: 'adminor',
        },
      ],
    },
    {
      name: 'server',
      type: 'select',
      options: [
        {
          label: '06-188-v1',
          value: '06-188-v1',
        },
        {
          label: '06-188-v2',
          value: '06-188-v2',
        },
        {
          label: '06-188-v9',
          value: '06-188-v9',
        },
        {
          label: '06-188-v18',
          value: '06-188-v18',
        },
        {
          label: '06-188-v19',
          value: '06-188-v19',
        },
        {
          label: '06-188-v20',
          value: '06-188-v20',
        },
        {
          label: '06-188-v21',
          value: '06-188-v21',
        },
        {
          label: '06-188-v22',
          value: '06-188-v22',
        },
        {
          label: '06-158-v1',
          value: '06-158-v1',
        },
        {
          label: '06-275-v1',
          value: '06-275-v1',
        },
      ],
    },
    {
      type: 'checkbox',
      name: 'ipRestriction',
      label: 'IP Restriction',
    },
    {
      type: 'row',
      fields: [
        {
          type: 'date',
          name: 'wcagUpdated',
        },
        {
          name: 'wcagLevel',
          type: 'select',
          options: [
            {
              label: '2.1 AA',
              value: '21aa',
            },
            {
              label: '2.1 AAA',
              value: '21aaa',
            },
          ],
        },
      ],
    },
    {
      type: 'date',
      name: 'bsScan',
      label: 'BS Scan',
    },
    {
      name: 'phpVersion',
      type: 'select',
      label: 'PHP Version',
      options: [
        {
          label: '7.4',
          value: '7.4',
        },
        {
          label: '8.2',
          value: '8.2',
        },
        {
          label: '8.3',
          value: '8.3',
        },
        {
          label: '8.4',
          value: '8.4',
        },
      ],
    },
    {
      name: 'framework',
      type: 'select',
      label: 'Framework (will override auto value)',
      options: [
        {
          label: 'CWAAS',
          value: 'cwaas',
        },
        {
          label: 'Eklips v1',
          value: 'eklips_v1',
        },
        {
          label: 'Eklips v2',
          value: 'eklips_v2',
        },
      ],
    },
    {
      type: 'select',
      name: 'newsFeeds',
      options: [
        {
          label: 'viaTT',
          value: 'viatt',
        },
      ],
    },
    {
      type: 'select',
      name: 'dataProvider',
      options: [
        {
          label: 'Datablocks',
          value: 'datablocks',
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    ...slugField(),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
  },
}
