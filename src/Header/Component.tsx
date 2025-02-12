import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header, Sidebar } from '@/payload-types'

export async function Header() {
  const headerPages: Header = await getCachedGlobal('header', 1)()
  const sidebarPosts: Sidebar = await getCachedGlobal('sidebar', 1)()

  return (
    <HeaderClient pages={headerPages} sidebarPosts={sidebarPosts} />
  )
}
