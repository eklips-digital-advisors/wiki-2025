'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import type { Header, Sidebar } from '@/payload-types'

import { HeaderTop } from '@/Header/Nav'
import Logo from '@/components/Logo'
import { SidebarClient } from '@/Sidebar'
import { ChevronLeft, Menu } from 'lucide-react'
import { cn } from '@/utilities/ui'
import LogoSmall from '@/components/LogoSmall'
import {usePathname} from "next/navigation";

interface HeaderClientProps {
  pages: Header,
  sidebarPosts: Sidebar
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ pages, sidebarPosts }) => {
  const pathname = usePathname()
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)

  useEffect(() => {
    setIsSidebarVisible(true)

    if (pathname.includes('/planning') || pathname.includes('/sites')) {
      setIsSidebarVisible(false)
    }
  }, [pathname])

  return (
    <motion.header
      layoutScroll
      className={`contents lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex ${isSidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}
    >
      <div className="contents bg-white lg:pointer-events-auto lg:block lg:w-72 lg:overflow-y-auto lg:border-r lg:border-zinc-900/10 lg:px-6 lg:pt-4 lg:pb-8 xl:w-80">
        <div className={`hidden lg:flex justify-between gap-2 ${isSidebarVisible ? '' : 'lg:flex-col gap-3'}`}>
          <Link className="logo flex justify-center" href="/">
            {isSidebarVisible ? <Logo /> : <LogoSmall />}
          </Link>
          <button
            className={cn('p-[6px] bg-transparent border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 rounded-lg cursor-pointer self-center')}
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          >
            {isSidebarVisible ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

        </div>
        <SidebarClient sidebarPosts={sidebarPosts} />
        <HeaderTop data={pages} />
      </div>
    </motion.header>
  )
}
