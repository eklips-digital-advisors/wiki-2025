'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Sidebar as SidebarType } from '@/payload-types'
import { ChevronRight } from 'lucide-react'

export const SidebarClient: React.FC<{ sidebarPosts: SidebarType }> = ({ sidebarPosts }) => {
  const pathname = usePathname()
  const [openMainItems, setOpenMainItems] = useState<number[]>([])
  const [openCategories, setOpenCategories] = useState<number[]>([]) // First category is open

  const toggleMainItem = (id: number) => {
    setOpenMainItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleCategory = (index: number) => {
    setOpenCategories((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  useEffect(() => {
    const currentSlug = pathname.split('/').pop();

    let foundMainItemId: number | null = null;
    let foundCategoryIndex: number | null = null;

    if (sidebarPosts?.items) {
      sidebarPosts.items.forEach((mainItem: any) => {
        mainItem.subItems?.forEach((category: any, categoryIndex: number) => {
          const matchingPost = category?.postsOrder?.find(
            (post: any) => post?.slug === currentSlug
          );

          if (matchingPost) {
            foundMainItemId = mainItem.id;
            foundCategoryIndex = categoryIndex;
          }
        });
      });
    }

    if (foundMainItemId !== null) {
      setOpenMainItems([foundMainItemId]);
    }

    if (foundCategoryIndex !== null) {
      setOpenCategories([foundCategoryIndex]);
    }
  }, [pathname, sidebarPosts]);



  const getCurrentClass = (slug: string) => {
    return slug.split('/').pop() === pathname.split('/').pop()
      ? 'border-emerald-500 font-medium'
      : 'border-zinc-900/10'
  }

  return (
    <div className="sidebar px-4 lg:px-0 mt-32 lg:mt-10">
      {sidebarPosts?.items && sidebarPosts?.items?.map((mainItem: any) => {
          return (
            <div key={mainItem?.id} className="sidebar-section">
              <div className="relative mt-6">
                <h2
                  className="text-xs font-semibold text-zinc-900 flex gap-2 justify-between items-center cursor-pointer"
                  onClick={() => toggleMainItem(mainItem?.id)}
                >
                  {mainItem?.title}
                  <ChevronRight
                    className={`w-4 h-4 transition duration-300 ease-in-out ${openMainItems.includes(mainItem?.id) ? 'rotate-90' : 'rotate-0'}`}
                  />
                </h2>
              </div>
              {mainItem?.subItems && mainItem?.subItems?.map((cat: any, i: any) => {
                  return (
                    <div key={i} className={`sidebar-subsection relative mt-3 pl-2 ${openMainItems.includes(mainItem?.id) ? 'visible' : 'hidden'}`}>
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
        })}
    </div>
  )
}
