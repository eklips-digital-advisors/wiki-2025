// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    avatar: {
      Component: '@/components/Users/AdminUserProfileImage'
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      actions: ['@/components/BeforeDashboard'],
      afterLogin: ['@/components/BeforeDashboard'],
      graphics: {
        Logo: '@/components/Logo',
        Icon: '@/components/Favicon'
      }
    }
  },
  collections: [Sites, Pages, Posts, Categories, Media, Users, Projects, TimeEntries],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Sidebar],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
})
