import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import React from 'react'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import { Button } from '@/components/ui/button'

export const HeaderTop: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:z-30 lg:px-8 backdrop-blur-xs lg:left-72 xl:left-80 dark:backdrop-blur-sm bg-white/[var(--bg-opacity-light)] dark:bg-zinc-900/[var(--bg-opacity-dark)]">
      <div className="absolute inset-x-0 top-full h-px transition bg-zinc-900/7.5 dark:bg-white/7.5"></div>
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-zinc-400" />
      </Link>
      <div className="flex items-center gap-6">
        <nav className="flex gap-3 items-center">
          {navItems.map(({ link }, i) => {
            return <CMSLink key={i} {...link} appearance="link" />
          })}
        </nav>
        <Button><Link href="/admin">Sign in</Link></Button>
      </div>
    </div>
  )
}
