import React from 'react'
import { cn } from '@/utilities/ui'

interface TdProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  className?: string
}

const Th: React.FC<TdProps> = ({ children, className, ...props }) => {
  return (
    <th scope="col" className={cn('py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900', className)} {...props}>
      {children}
    </th>
  )
}

export default Th
