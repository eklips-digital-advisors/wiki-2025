'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'
import { BookText } from 'lucide-react'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'title' | 'content' | 'authors' | '_status'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, title } = doc || {}
  const category = Array.isArray(categories) ? categories[0] : null

  const titleToUse = titleFromProps || title
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'overflow-hidden hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="rounded-2xl flex flex-col justify-end items-start px-4 py-4 min-h-[200px] border border-zinc-200 bg-zinc-50/20 hover:border-zinc-300">
        {titleToUse && (
          <>
            <span className="rounded-full border border-zinc-200 p-1 bg-zinc-50/50 inline-block mb-auto">
              <BookText className="w-4 h-4 stroke-zinc-500 stroke-1" />
            </span>
            <div className="prose">
              <h3>
                <Link className="not-prose" href={href} ref={link.ref}>
                  {titleToUse}
                </Link>
              </h3>
            </div>
            {showCategories && categories && (
              <div className="text-xs text-zinc-400 mb-4">
                {showCategories && category && (
                  <div>{category?.title}</div>
                )}
              </div>
            )}
            <Link
              className="mt-4 inline-flex gap-0.5 justify-center overflow-hidden text-sm font-medium transition text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-500"
              href={href} ref={link.ref}>
              Read more
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="mt-0.5 h-5 w-5 relative top-px -mr-1">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                      d="m11.5 6.5 3 3.5m0 0-3 3.5m3-3.5h-9"></path>
              </svg>
            </Link>
          </>
        )}
      </div>
    </article>
  )
}
