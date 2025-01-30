'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {usePathname} from "next/navigation";

interface SidebarProps {
  sidebarData: {
    id: string
    slug: string
    title: string
    posts: { id: string; slug: string; title: string }[]
  }[]
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarData }) => {
  const pathname = usePathname()

  const getCurrentClass = (slug: string) => {
    return slug.split('/').pop() === pathname.split('/').pop() ? 'border-emerald-500' : 'border-zinc-900/10'
  }
  
  return (
    <div className="mt-10">
      {sidebarData.map((single, i) => {
        return (
          <div key={i} className="relative mt-6">
            <motion.h2
              layout="position"
              className="text-xs font-semibold text-zinc-900 dark:text-white"
            >
              <Link href={single.slug ?? '#'}>{single.title}</Link>
            </motion.h2>
            <div className="relative mt-3 pl-2">
              <ul role="list" className="border-l border-transparent">
                {single?.posts.map((post) => {
                  console.log('posts slug', post.slug)
                  return (
                    <li className="relative" key={post?.id}>
                      <Link
                        className={`${getCurrentClass(post?.slug)} flex justify-between gap-2 py-1 pr-3 text-sm transition pl-4 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border-l hover:border-emerald-500`}
                        href={`/${post.slug}`}
                      >
                        <span className="truncate">{post.title}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}
