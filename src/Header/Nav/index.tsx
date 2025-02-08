import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import { Button } from '@/components/ui/button'

interface UserData {
  user: string
}

export const HeaderTop: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setUserData(result);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Fetch error:", error.message);
        }
      } finally {
        console.log('done')
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures it runs only once when component mounts

  return (
    <div className="header-top fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:z-30 lg:px-8 backdrop-blur-xs lg:left-72 xl:left-80 dark:backdrop-blur-sm bg-white/[var(--bg-opacity-light)] dark:bg-zinc-900/[var(--bg-opacity-dark)]">
      <div className="absolute inset-x-0 top-full h-px transition bg-zinc-900/7.5 dark:bg-white/7.5"></div>
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-zinc-400" />
      </Link>
      <div className="flex items-center gap-4 md:gap-8">
        <nav className="flex gap-4 md:gap-8 items-center">
          {navItems.map(({ link }, i) => {
            return <CMSLink key={i} {...link} appearance="link" />
          })}
        </nav>
        {!userData?.user && <Button><Link href="/admin">Sign in</Link></Button>}
      </div>
    </div>
  )
}
