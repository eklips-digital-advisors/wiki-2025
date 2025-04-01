'use client'
import StatsChart from '@/blocks/StatsBlock/StatsChart'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LoaderCircle } from 'lucide-react'

export const StatsBlockClient = ({
  combinedStats,
  buildTime,
  titleHeading
}: {
  combinedStats: any
  buildTime: string
  titleHeading: string
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pullText, setPullText] = useState('Pull new data')
  const revalidate = async () => {
    setLoading(true)
    setPullText('Pulling, please wait...')
    await fetch('/next/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: '/statistics' }), // Pass the path dynamically
    });
    router.refresh()
  }

  useEffect(() => {
    setLoading(false)
    setPullText('Pull new data')
  }, [buildTime])

  return (
    <div className="w-2/3 prose">
      <h2>{titleHeading}</h2>
      <div className="text-sm flex flex-wrap items-center gap-4">
        <Button
          variant="link"
          size="sm"
          className="cursor-pointer p-0 underline inline-flex gap-1 items-center"
          onClick={revalidate}
        >
          {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
          {pullText}
        </Button>
        {buildTime && (
          <p className="text-zinc-500">Last update: {buildTime}</p>
        )}
      </div>
      <StatsChart siteChartData={combinedStats} />
    </div>
  )
}
