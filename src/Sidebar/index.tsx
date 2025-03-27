'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Sidebar as SidebarType } from '@/payload-types'
import { ChevronRight } from 'lucide-react'

export const SidebarClient: React.FC<{ sidebarPosts: SidebarType }> = ({ sidebarPosts }) => {
  const pathname = usePathname()
  const [openMainItems, setOpenMainItems] = useState<number[]>([])
  const [openMainCategories, setOpenMainCategories] = useState<number[]>([]) // First category is open
  const [openCategories, setOpenCategories] = useState<number[]>([]) // First category is open

  const toggleMainItem = (id: number) => {
    setOpenMainItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleMainCategory = (index: number) => {
    setOpenMainCategories((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
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
    let foundMainCategoryIndex: number | null = null;
    let foundCategoryIndex: number | null = null;

    if (sidebarPosts?.items) {
      sidebarPosts.items.forEach((mainItem: any, mainItemIndex: number) => {
        const matchingMainPost = mainItem?.firstLevelPostsOrder?.find(
          (post: any) => post?.slug === currentSlug
        );

        if (matchingMainPost) {
          foundMainCategoryIndex = mainItemIndex;
        }

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

    if (foundMainCategoryIndex !== null) {
      setOpenMainCategories([foundMainCategoryIndex]);
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
      {sidebarPosts?.items && sidebarPosts?.items?.map((mainItem: any, mainItemIndex) => {
          return (
            <div key={mainItem?.id} className="sidebar-section">
              {mainItem?.title &&
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
              }
              {!mainItem?.title &&
                <>
                  <div className="relative mt-6">
                    <h2
                      className="text-xs font-semibold text-zinc-900 flex gap-2 justify-between items-center cursor-pointer"
                      onClick={() => toggleMainCategory(mainItemIndex)}
                    >
                      {mainItem?.firstLevelCategoriesOrder?.title}
                      <ChevronRight
                        className={`w-4 h-4 transition duration-300 ease-in-out ${openMainCategories.includes(mainItemIndex) ? 'rotate-90' : 'rotate-0'}`}
                      />
                    </h2>
                  </div>

                  <div className={`sidebar-subsection relative mt-3 pl-2 ${openMainCategories.includes(mainItemIndex) ? 'visible' : 'hidden'}`}>
                    <ul role="list" className="border-l border-transparent">
                      {mainItem?.firstLevelPostsOrder &&
                        mainItem?.firstLevelPostsOrder.map((post: any) => {
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
                </>
              }
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
