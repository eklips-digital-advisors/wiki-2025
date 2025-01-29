import React from 'react'
import "./styles.css"
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { AdminBar } from '@/components/AdminBar'
import { Header } from '@/Header/Component'
import { Footer } from '@/Footer/Component'
import { draftMode } from 'next/headers'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
    <head></head>
    <body>
    <AdminBar
      adminBarProps={{
        preview: isEnabled,
      }}
    />

    <Header />
    {children}
    <Footer />
    </body>
    </html>
  )
}
