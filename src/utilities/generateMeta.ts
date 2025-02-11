import type { Metadata } from 'next'

import type { Page, Post } from '../payload-types'

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

  const title = doc?.title
    ? doc?.title + ' | Eklips Wiki'
    : 'Eklips Wiki'

  return {
    description: 'Eklips Wiki 2.0',
    title,
  }
}
