import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import React from 'react'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import {usePathname} from "next/navigation";

export const HeaderTop: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()

  const getCurrentClass = (label: string) => {
    if (label === pathname.replace(/^\/+/, '')) {
      return 'underline'
    }

    return ''
  }

  return (
    <div className="header-top fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:z-30 lg:px-8 backdrop-blur-xs lg:left-72 xl:left-80">
      <div className="absolute inset-x-0 top-full h-px transition bg-zinc-900/7.5"></div>
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-zinc-400" />
      </Link>
      <div className="flex items-center gap-4 md:gap-8">
        <nav className="flex gap-4 md:gap-8 items-center">
          {navItems.map(({ link }, i) => {
            return <CMSLink key={i} {...link} appearance="link" className={`${getCurrentClass(link?.label.toLowerCase())}`} />
          })}
        </nav>
      </div>
    </div>
  )
}
