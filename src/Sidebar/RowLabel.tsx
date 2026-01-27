'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

export const RowLabelSidebar: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<any>()

  const categoryId = data?.data?.categoriesOrder
  const [categoryName, setCategoryName] = useState<string | null>('')

  useEffect(() => {
    if (categoryId) {
      fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/categories/${categoryId}`)
        .then((res) => res.json())
        .then((category) => {
          setCategoryName(category?.title || 'Unknown Category')
        })
        .catch(() => setCategoryName('Unknown Category'))
    }
  }, [categoryId])

  const label = data?.data?.categoriesOrder
    ? `Category item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${categoryName}`
    : 'Category'

  return <div>{label}</div>
}
