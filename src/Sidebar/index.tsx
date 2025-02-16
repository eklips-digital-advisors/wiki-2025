'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Sidebar as SidebarType } from '@/payload-types'
import { ChevronRight } from 'lucide-react'

export const SidebarClient: React.FC<{ sidebarPosts: SidebarType }> = ({ sidebarPosts }) => {
  const pathname = usePathname()
  const [openCategories, setOpenCategories] = useState<number[]>([0]) // First category is open

  const toggleCategory = (index: number) => {
    setOpenCategories((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  const getCurrentClass = (slug: string) => {
    return slug.split('/').pop() === pathname.split('/').pop()
      ? 'border-emerald-500 font-medium'
      : 'border-zinc-900/10'
  }

  return (
    <div className="sidebar px-4 lg:px-0 mt-32 lg:mt-10">
      {sidebarPosts?.items &&
        sidebarPosts?.items?.map((cat: any, i) => {
          return (
            <div key={i} className="relative mt-6">
              <h2
                className="text-xs font-semibold text-zinc-900 flex gap-2 justify-between items-center cursor-pointer"
                onClick={() => toggleCategory(i)}
              >
                {cat?.categoriesOrder?.title}
                <ChevronRight
                  className={`w-4 h-4 transition duration-300 ease-in-out ${openCategories.includes(i) ? 'rotate-90' : 'rotate-0'}`}
                />
              </h2>

              <div className={`sidebar-section relative mt-3 pl-2 ${openCategories.includes(i) ? 'visible' : 'hidden'}`}>
                <ul role="list" className="border-l border-transparent">
                  {cat?.postsOrder &&
                    cat?.postsOrder.map((post: any) => {
                      if (!post?.id) return null
                      return (
                        <li className="relative" key={post?.id}>
                          <Link
                            className={`${getCurrentClass(post?.slug)} flex justify-between gap-2 py-1 pr-3 text-sm transition pl-4 text-zinc-600 hover:text-zinc-900 border-l hover:border-emerald-500`}
                            href={`/posts/${post.slug}`}
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
                                href={`/posts/${post.slug}#section-${index}`}
                              >
                                <span className="truncate">
                                  <span className="text-emerald-500">#</span> {section?.sectionName}
                                </span>
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
