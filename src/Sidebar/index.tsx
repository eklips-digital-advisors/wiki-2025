'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Post } from '@/payload-types'

interface SidebarProps {
  posts: Post[],
}

export const Sidebar: React.FC<SidebarProps> = ({ posts }) => {
  const pathname = usePathname()

  const getCurrentClass = (slug: string) => {
    return slug.split('/').pop() === pathname.split('/').pop()
      ? 'border-emerald-500'
      : 'border-zinc-900/10'
  }

  const groupedByCategories = posts.reduce((acc: any, post: any) => {
      const category = post?.categories;

      const categoryKey = category.id;

      if (!acc[categoryKey]) {
          acc[categoryKey] = {
              id: category.id,
              title: category.title,
              slug: category.slug,
              posts: []
          };
      }

      acc[categoryKey].posts.push({
          id: post.id,
          title: post.title,
          slug: `posts/${post.slug}`,
          sections: post.sections,
      });

      return acc;
  }, {});
  
  const groupedByCategoriesArray = Object.values(groupedByCategories);

  return (
    <div className="px-4 lg:px-0 mt-32 lg:mt-10">
      {groupedByCategoriesArray.map((cat: any, i) => {
        return (
          <div key={i} className="relative mt-6">
            <motion.h2
              layout="position"
              className="text-xs font-semibold text-zinc-900 dark:text-white"
            >
              {cat.title}
            </motion.h2>
            <div className="relative mt-3 pl-2">
              <ul role="list" className="border-l border-transparent">
                {cat?.posts.map((post: any) => {
                  return (
                    <li className="relative" key={post?.id}>
                      <Link
                        className={`${getCurrentClass(post?.slug)} flex justify-between gap-2 py-1 pr-3 text-sm transition pl-4 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border-l hover:border-emerald-500`}
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
                            className={`${getCurrentClass(post?.slug)} flex justify-between gap-2 pl-6 py-1 pr-3 text-[12px] transition text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border-l hover:border-emerald-500`}
                            href={`/${post.slug}#section-${index}`}
                          >
                            <span className="truncate"># {section?.sectionName}</span>
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
