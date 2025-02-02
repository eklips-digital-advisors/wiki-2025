import React from 'react'
import { cn } from '@/utilities/ui'

interface TdProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  className?: string
}

const Td: React.FC<TdProps> = ({ children, className, ...props }) => {
  return (
    <td className={cn('px-4 py-2', className)} {...props}>
      {children}
    </td>
  )
}

export default Td
