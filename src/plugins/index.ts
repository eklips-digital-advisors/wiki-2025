import fs from 'fs'
import { searchPlugin } from '@payloadcms/plugin-search'
import type { CollectionConfig, CollectionSlug, Plugin } from 'payload'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import path from 'path'
import { fileURLToPath } from 'url'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { r2Storage } from '@payloadcms/storage-r2'
import { getCloudflareContextFromWrangler } from '@/utilities/getCloudflareContextFromWrangler'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) =>
  realpath(value)?.endsWith(path.join('payload', 'bin.js')),
)
const isProduction = process.env.NODE_ENV === 'production'

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

type R2StorageBucket = Parameters<typeof r2Storage>[0]['bucket']
const r2Bucket = cloudflare.env.R2 as unknown as R2StorageBucket

const importExportCollectionSlugs: CollectionSlug[] = [
  'sites',
  'pages',
  'posts',
  'categories',
  'media',
  'users',
  'projects',
  'time-entries',
  'status-time-entries',
  'site-maps',
]

const importExportCollectionOverride = ({ collection }: { collection: CollectionConfig }) =>
  collection

export const plugins: Plugin[] = [
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: {
        group: 'Globals',
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  importExportPlugin({
    collections: importExportCollectionSlugs.map((slug) => ({
      slug,
      export: {
        disableJobsQueue: true,
        overrideCollection: importExportCollectionOverride,
      },
      import: {
        disableJobsQueue: true,
        overrideCollection: importExportCollectionOverride,
      },
    })),
    overrideExportCollection: ({ collection }) => ({
      ...collection,
      admin: {
        ...(collection.admin || {}),
        group: 'Globals',
      },
      upload: {
        ...(typeof collection.upload === 'object' ? collection.upload : {}),
        staticDir: path.resolve(dirname, '../../public/exports'),
      },
    }),
  }),
  r2Storage({
    bucket: r2Bucket,
    collections: { media: true },
  }),
]
