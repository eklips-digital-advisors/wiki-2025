import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import {
  fontDeliveryOptions,
  fontLicenceOptions,
  frameworkOptions,
  hostingOptions,
  phpVersionOptions,
  pressReleasesOptions,
  serverOptions,
  siteServiceOptions,
  wcagOptions,
} from '@/collections/Sites/selectOptions'

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
          name: 'azureDevops',
          type: 'text',
          admin: {
            components: {
              Field: '@/utilities/GetAzureDevopsRepos/getAzureDevopsRepos#GetAzureDevopsRepos',
            },
          },
        },
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
      options: siteServiceOptions,
    },
    {
      name: 'hosting',
      type: 'select',
      options: hostingOptions,
    },
    {
      name: 'server',
      type: 'select',
      options: serverOptions,
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
          admin: {
            date: {
              displayFormat: 'dd.MM.yyyy',
            },
          },
        },
        {
          name: 'wcagLevel',
          type: 'select',
          options: wcagOptions,
        },
      ],
    },
    {
      type: 'date',
      name: 'bsScan',
      label: 'BS Scan',
      admin: {
        date: {
          displayFormat: 'dd.MM.yyyy',
        },
      },
    },
    {
      name: 'phpVersion',
      type: 'select',
      label: 'PHP Version',
      options: phpVersionOptions,
    },
    {
      name: 'framework',
      type: 'select',
      label: 'Framework (will override auto value)',
      options: frameworkOptions,
    },
    {
      name: 'pressReleases',
      type: 'select',
      label: 'Press releases',
      options: pressReleasesOptions,
      hasMany: true,
    },
    // --- Fonts -------------------------------------------------------------
    {
      name: 'fonts',
      label: 'Fonts',
      type: 'array',
      labels: {
        singular: 'Font',
        plural: 'Fonts',
      },
      admin: {
        description: 'Add one row per typeface/family in use on this site.',
      },
      fields: [
        {
          name: 'family',
          label: 'Family',
          type: 'text',
          required: true,
          admin: { placeholder: 'e.g., Noe Display, Inter, Aperçu' },
        },
        {
          name: 'provider',
          label: 'Provider',
          type: 'text',
          admin: { placeholder: 'e.g., MyFonts, Google, Adobe, In-house' },
        },
        {
          name: 'delivery',
          label: 'Delivery',
          type: 'select',
          options: fontDeliveryOptions,
          required: true,
          defaultValue: 'self-hosted',
        },
        {
          name: 'licence',
          label: 'Licence',
          type: 'select',
          options: fontLicenceOptions,
          admin: {
            description: '',
          },
        },
        {
          name: 'notes',
          label: 'Notes',
          type: 'text',
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
