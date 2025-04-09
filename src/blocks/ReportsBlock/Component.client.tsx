'use client'

import React, { useEffect, useState } from 'react'
import { Folder } from 'lucide-react'
import Link from 'next/link'

export const ReportsBlockClient = () => {
  const [folders, setFolders] = useState<string[]>([])

  useEffect(() => {
    const getReports = async () => {
      const res = await fetch('/next/reports', { cache: 'no-store' }) // disable cache
      const data = await res.json()
      setFolders(data.folders)
    }

    getReports()
  }, [])

  return (
    <div className="prose">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 not-prose">
        {folders.map((folder, index) => (
          <Link
            key={index}
            target={`_blank`}
            className="border border-zinc-200 hover:border-emerald-300 rounded-md py-2 px-4 flex gap-4 items-center"
            href={`/reports/${folder}/index.html`}
          >
            <Folder className="w-5 h-5 stroke-emerald-600" />
            {folder}
          </Link>
        ))}
      </div>
    </div>
  )
}
