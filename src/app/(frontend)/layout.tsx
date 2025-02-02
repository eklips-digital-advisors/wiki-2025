import React from 'react'
import './styles.css'
import './tailwind.css'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { AdminBar } from '@/components/AdminBar'
import { Header } from '@/Header/Component'
import { Footer } from '@/Footer/Component'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { HeroPattern } from '@/components/Patterns/HeroPattern'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const categories = await payload.find({
    collection: 'categories',
  })

  const pages = await payload.find({
    collection: 'pages',
  })

  return (
    <html
      className={`${cn(GeistSans.variable, GeistMono.variable)} h-full`}
      lang="en"
      suppressHydrationWarning
    >
      <head></head>
      <body className="flex min-h-full bg-white antialiased">
        {/*<AdminBar*/}
        {/*  adminBarProps={{*/}
        {/*    preview: isEnabled,*/}
        {/*  }}*/}
        {/*/>*/}

        <div className="w-full">
          <HeroPattern />
          <div className="h-full lg:ml-72 xl:ml-80">
            <Header />
            <div className="relative flex h-full flex-col px-4 pt-14 sm:px-6 lg:px-8">
              <main className="flex-auto">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
