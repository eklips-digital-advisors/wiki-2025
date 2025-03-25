'use client'
import React, { useState } from 'react'
import { useField, SelectInput } from '@payloadcms/ui'

interface FetchOption {
  label: string
  value: string
}

export const DropdownValueAsLabel: React.FC<{
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
        value={value}
        onChange={(e: any) => setValue(e ? e.label : null)}
      />
    </>
  )
}
