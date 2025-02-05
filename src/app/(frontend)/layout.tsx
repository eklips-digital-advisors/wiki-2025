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
import { HeroPattern } from '@/components/Patterns/HeroPattern'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html
      className={`${cn(GeistSans.variable, GeistMono.variable)} h-full scroll-pt-40`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <title>Eklips Wiki</title>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
      </head>
      <body className="flex min-h-full bg-white antialiased">
        <AdminBar
          adminBarProps={{
            preview: isEnabled,
          }}
        />

        <div className="w-full">
          <HeroPattern />
          <div className="h-full lg:ml-72 xl:ml-80">
            <Header />
            <div className="relative flex h-full flex-col px-4 lg:pt-14 sm:px-6 lg:px-8">
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
