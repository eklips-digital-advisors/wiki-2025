// storage-adapter-import-placeholder
import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
// import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import sharp from 'sharp'

import { Users } from '@/collections/Users'
import { Media } from './collections/Media'
import { Posts } from '@/collections/Posts'
import { Categories } from '@/collections/Categories'
import { Pages } from '@/collections/Pages'
import { Sites } from '@/collections/Sites'
import { Projects } from '@/collections/Projects'
import { TimeEntries } from '@/collections/TimeEntries'
import { Header } from './Header/config'
import { plugins } from '@/plugins'
import { Sidebar } from '@/Sidebar/config'
import { getServerSideURL } from '@/utilities/getURL'
import { StatusTimeEntries } from '@/collections/StatusTimeEntries'
import { SiteMaps } from '@/collections/SiteMaps'
import migrations from './db/migrations'
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

export default buildConfig({
  admin: {
    user: Users.slug,
    avatar: {
      Component: '@/components/Users/AdminUserProfileImage',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      actions: ['@/components/BeforeDashboard'],
      afterLogin: ['@/components/BeforeDashboard'],
      graphics: {
        Logo: '@/components/Logo',
        Icon: '@/components/Favicon',
      },
    },
  },
  collections: [
    Sites,
    Pages,
    Posts,
    Categories,
    Media,
    Users,
    Projects,
    TimeEntries,
    StatusTimeEntries,
    SiteMaps,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Sidebar],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URI || '',
  // }),
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
  }),
  sharp,
  plugins,
})
