import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header, Category, Post } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function Header() {
  const headerPages: Header = await getCachedGlobal('header', 1)()
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
  })
  
  // console.log('posts', posts?.docs)

  const categories = await payload.find({
    collection: 'categories',
  })
  
  // console.log('categories', categories?.docs)

  function restructureData(categories: Category[], posts: Post[]) {
    const categoryMap = new Map();

    categories.forEach((category) => {
      categoryMap.set(category.id, {
        id: category.id,
        title: category.title,
        slug: category.slug,
        posts: [],
      });
    });

    posts.forEach((post: Post) => {
      const categoryId = post?.categories?.id ?? '';
      if (categoryMap.has(categoryId)) {
        categoryMap.get(categoryId).posts.push({
          id: post.id,
          title: post.title,
          slug: `posts/${post.slug}`,
          sections: post.sections,
        });
      }
    });

    return Array.from(categoryMap.values());
  }
  
  const structuredData = restructureData(categories?.docs, posts?.docs);

  return (
    <HeaderClient pages={headerPages} sidebarData={structuredData} />
  )
}
