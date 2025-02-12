'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Sidebar as SidebarType } from '@/payload-types'

export const SidebarClient: React.FC<{ sidebarPosts: SidebarType }> = ({ sidebarPosts }) => {
  const pathname = usePathname()

  const getCurrentClass = (slug: string) => {
    return slug.split('/').pop() === pathname.split('/').pop()
      ? 'border-emerald-500 font-medium'
      : 'border-zinc-900/10'
  }

  return (
    <div className="px-4 lg:px-0 mt-32 lg:mt-10">
      {sidebarPosts?.items?.map((cat: any, i) => {
        return (
          <div key={i} className="relative mt-6">
            <motion.h2
              layout="position"
              className="text-xs font-semibold text-zinc-900"
            >
              {cat?.categoriesOrder?.title}
            </motion.h2>
            <div className="relative mt-3 pl-2">
              <ul role="list" className="border-l border-transparent">
                {cat?.postsOrder.map((post: any) => {
                  return (
                    <li className="relative" key={post?.id}>
                      <Link
                        className={`${getCurrentClass(post?.slug)} flex justify-between gap-2 py-1 pr-3 text-sm transition pl-4 text-zinc-600 hover:text-zinc-900 border-l hover:border-emerald-500`}
                        href={`/${post.slug}`}
                      >
                        <span className="truncate">{post.title}</span>
                      </Link>
                      {post?.sections &&
                        post?.slug.split('/').pop() === pathname.split('/').pop() &&
                        post?.sections?.length > 0 &&
                        post?.sections.map((section: any, index: number) => (
                          <Link
                            key={index}
                            className={`${getCurrentClass(post?.slug)} flex justify-between gap-2 pl-6 py-1 pr-3 text-[12px] transition text-zinc-600 hover:text-zinc-900 border-l hover:border-emerald-500`}
                            href={`/${post.slug}#section-${index}`}
                          >
                            <span className="truncate"><span className="text-emerald-500">#</span> {section?.sectionName}</span>
                          </Link>
                        ))}
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
