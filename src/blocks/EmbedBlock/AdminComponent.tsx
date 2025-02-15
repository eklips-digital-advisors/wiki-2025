'use client'
import React from 'react';
import { useFormFields, TextareaField } from '@payloadcms/ui'

export const EmbedBlockAdmin = ({path}: {path: any}) => {
  const [content, setContent]: [string, (value: string) => void] = useFormFields(([fields, dispatch]) => [
    fields[path]?.value as string,
    (value: string) => {
      dispatch({
        type: 'UPDATE',
        path,
        value,
      })
    },
  ])

  return (
    <TextareaField path={path} field={path} />
  )
};
