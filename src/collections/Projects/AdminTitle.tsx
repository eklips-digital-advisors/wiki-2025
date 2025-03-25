'use client'

import { useEffect } from 'react'
import { useField } from '@payloadcms/ui'

export const AdminTitle = () => {
  const { value, setValue } = useField<string>({ path: 'title' })
  const { value: imageValue, setValue: setImageValue } = useField<string>({ path: 'image' })
  const { value: projectTeamwork } = useField<string>({ path: 'projectTeamwork' })

  useEffect(() => {
    const fetchProject = async (id: string) => {
      try {
        const res = await fetch(`/next/get-project?id=${id}`)
        const data = await res.json()
        console.log('Fetched project:', data)

        if (data?.name && data.name !== value) {
          setValue(data.name)
        }

        if (data?.logo && data.logo !== imageValue) {
          setImageValue(data.logo)
        }
      } catch (err) {
        console.error('Error fetching project:', err)
      }
    }

    if (projectTeamwork) {
      fetchProject(projectTeamwork)
    }
  }, [projectTeamwork])

  return null // Better than returning an empty string
}
