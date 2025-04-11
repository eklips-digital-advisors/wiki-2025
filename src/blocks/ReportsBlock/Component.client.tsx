'use client'

import React, { useEffect, useState } from 'react'
import { Folder } from 'lucide-react'
import Link from 'next/link'

export const ReportsBlockClient = () => {
  const [folders, setFolders] = useState<string[]>([])

  useEffect(() => {
    const getReports = async () => {
      const res = await fetch('/next/cypress-reports', { cache: 'no-store' }) // disable cache
      const data = await res.json()
      const sorted = data.folders.sort((a: string, b: string) => a.localeCompare(b))
      setFolders(data.folders)
    }

    getReports()
  }, [])

  const getFirstLetter = (str: string) => str.charAt(0).toUpperCase()

  return (
    <div className="prose">
      <div className="not-prose">
        {folders.map((folder, index) => {
          const prevLetter = index > 0 ? getFirstLetter(folders[index - 1]) : ''
          const currentLetter = getFirstLetter(folder)
          const isNewGroup = currentLetter !== prevLetter

          return (
            <Link
              key={index}
              target={`_blank`}
              className={`leading-4 flex gap-2 items-center ${isNewGroup ? 'mt-6' : 'mt-1'}`}
              href={`/cypress-reports/${folder}/index.html`}
            >
              <Folder className="w-5 h-5 stroke-emerald-600" />
              {folder}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
