'use client'
import Link from 'next/link'
import React from 'react'
import { motion } from 'framer-motion'

import type { Header, Post, User } from '@/payload-types'

import { HeaderTop } from '@/Header/Nav'
import Logo from '@/components/Logo'
import { Sidebar } from '@/Sidebar'

interface HeaderClientProps {
  pages: Header,
  posts: Post[],
  user: User | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ pages, posts, user }) => {
  return (
    <motion.header
      layoutScroll
      className="contents lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex"
    >
      <div className="contents bg-white lg:pointer-events-auto lg:block lg:w-72 lg:overflow-y-auto lg:border-r lg:border-zinc-900/10 lg:px-6 lg:pt-4 lg:pb-8 xl:w-80 lg:dark:border-white/10">
        <div className="hidden lg:flex">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <Sidebar posts={posts} />
        <HeaderTop data={pages} user={user} />
      </div>
    </motion.header>
  )
}
