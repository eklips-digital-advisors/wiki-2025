'use client'
import { Sidebar } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabelSidebar: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Sidebar['items']>[number]>()

  const label = data?.data?.categoriesOrder
    ? `Category item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.categoriesOrder}`
    : 'Category'

  return <div>{label}</div>
}
