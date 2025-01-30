'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.push(`/search${debouncedValue ? `?q=${debouncedValue}` : ''}`)
  }, [debouncedValue, router])

  return (
    <div className="min-w-84">
      <form
        className="relative flex items-center"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5 stroke-current absolute left-2 top-1/2 transform -translate-y-1/2 text-zinc-500">
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M12.01 12a4.25 4.25 0 1 0-6.02-6 4.25 4.25 0 0 0 6.02 6Zm0 0 3.24 3.25"></path>
        </svg>
        <Label htmlFor="search" className="sr-only">
          Find something...
        </Label>
        <Input
          id="search"
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder="Find something..."
        />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
