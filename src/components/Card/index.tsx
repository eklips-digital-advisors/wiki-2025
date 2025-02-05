'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

export type CardPostData = Pick<Post, 'slug' | 'title' | 'content'> & {
  categories?: { relationTo?: string | null; id?: string | null; title?: string | null }[] | null;
};

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

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
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
      <div className="">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            {showCategories && hasCategories && (
              <div>
                {categories?.map((category, index) => {
                  if (typeof category === 'object') {
                    const { title: titleFromCategory } = category

                    const categoryTitle = titleFromCategory || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }

                  return null
                })}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <>
            <div className="prose">
              <h3>
                <Link className="not-prose" href={href} ref={link.ref}>
                  {titleToUse}
                </Link>
              </h3>
            </div>
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
