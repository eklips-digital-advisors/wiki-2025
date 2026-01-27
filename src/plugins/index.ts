import fs from 'fs'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
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

const isCLI = process.argv.some((value) => realpath(value).endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

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
    collections: ['sites'],
    overrideExportCollection: (collection) => {
      collection.admin.group = 'Globals'
      collection.upload.staticDir = path.resolve(dirname, '../../public/exports')
      return collection
    },
    disableJobsQueue: true,
  }),
  r2Storage({
    bucket: cloudflare.env.R2,
    collections: { media: true },
  }),
]
