'use client'
import React, { useState } from 'react'
import { useField, SelectInput } from '@payloadcms/ui'

interface FetchOption {
  label: string
  value: string
}

export const Dropdown: React.FC<{
  path: string
  fetchedOptions: FetchOption[]
  label: string
}> = ({ path, fetchedOptions, label }) => {
  const [options] = useState(fetchedOptions)
  const { value, setValue } = useField<string>({ path })

  return (
    <>
      <SelectInput
        path={path}
        name={path}
        label={label}
        options={options}
        value={fetchedOptions.find((option) => option.value == value)?.label || ''}
        onChange={(e: any) => setValue(e ? e.value : null)}
      />
    </>
  )
}
