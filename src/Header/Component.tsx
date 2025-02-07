import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'

export async function Header() {
  const headerPages: Header = await getCachedGlobal('header', 1)()
  
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  const posts = await payload.find({
    collection: 'posts',
    limit: -1
  })

  return (
    <HeaderClient pages={headerPages} posts={posts.docs} user={user} />
  )
}
