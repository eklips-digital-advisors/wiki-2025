import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { notFound } from 'next/navigation'
import { formatDateTime } from '@/utilities/formatDateTime'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) notFound()

  return (
    <article className="pt-16 pb-16">
      {draft && <LivePreviewListener />}

      <div className="flex flex-col items-center gap-4">
        <div className="container max-w-[68rem] mx-auto">
          <div className="flex flex-col gap-1 mb-6">
            <div className="prose mb-4">
              <h1 className="">{post.title}</h1>
            </div>
            {post?.populatedAuthors && post?.populatedAuthors.length > 0 && post?.populatedAuthors.map(author => (
              <div className="text-zinc-500 text-xs flex gap-1 items-center" key={author.id}>Author: {author?.name}</div>
            )) }
            {post?.publishedAt && false && <div className="text-zinc-500 text-xs">Published: {formatDateTime(post.publishedAt || '')}</div>}
          </div>
          {post.content && (
            <RichText className="max-w-[68rem] mx-auto mb-14" data={post.content} enableGutter={false} />
          )}
          {post?.sections &&
            post.sections.length > 0 &&
            post.sections.map((section, index) => (
              <div key={index} id={'section-' + index} className="post-section mb-16">
                <div className="prose mb-6 border-b border-b-zinc-200 pb-4 text-xl">
                  <span className="text-emerald-500">#</span> {section?.sectionName}
                </div>
                <RichText
                  className="max-w-[68rem] mx-auto"
                  data={section.content}
                  enableGutter={false}
                />
              </div>
            ))}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
