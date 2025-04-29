import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const plugins: Plugin[] = [
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
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
]
