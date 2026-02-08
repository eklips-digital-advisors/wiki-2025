import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const exportsStaticDir = path.resolve(dirname, '../../public/exports')

const importExportCollections = [
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
] as const

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
    collections: importExportCollections.map((slug) => ({
      slug,
      export: {
        disableJobsQueue: true,
      },
      import: {
        disableJobsQueue: true,
      },
    })),
    overrideExportCollection: ({ collection }) => {
      return {
        ...collection,
        admin:
          collection.admin && typeof collection.admin === 'object'
            ? {
                ...collection.admin,
                group: 'Globals',
              }
            : {
                group: 'Globals',
              },
        upload:
          collection.upload && typeof collection.upload === 'object'
            ? {
                ...collection.upload,
                staticDir: exportsStaticDir,
              }
            : collection.upload,
      }
    },
    overrideImportCollection: ({ collection }) => {
      return {
        ...collection,
        admin:
          collection.admin && typeof collection.admin === 'object'
            ? {
                ...collection.admin,
                group: 'Globals',
              }
            : {
                group: 'Globals',
              },
        upload:
          collection.upload && typeof collection.upload === 'object'
            ? {
                ...collection.upload,
                staticDir: exportsStaticDir,
              }
            : collection.upload,
      }
    },
  }),
]
