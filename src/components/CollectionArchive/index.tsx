import { cn } from '@/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container')}>
      <div className="grid grid-cols-1 gap-8 border-t mt-6 border-zinc-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4">
        {posts?.map((result, index) => {
          if (typeof result === 'object' && result !== null && result?._status === 'published') {
            return (
              <div className="" key={index}>
                <Card className="h-full" doc={result} relationTo="posts" showCategories />
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
