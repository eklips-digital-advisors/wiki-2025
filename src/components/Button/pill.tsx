import React from 'react'
import { Plus, X } from 'lucide-react'

interface PillProps {
  active?: boolean
  type?: string
  children?: React.ReactNode
  onClick?: () => void
}

const getClassNames = (type?: string) => {
  return 'border-zinc-300'

  if (type === 'server') {
    return 'border-blue-300'
  }
  if (type === 'date') {
    return 'border-yellow-300'
  }
  if (type === 'feature') {
    return 'border-rose-300'
  }
  if (type === 'test') {
    return 'border-green-300'
  }
  if (type === 'external') {
    return 'border-yellow-900'
  } else {
    return 'border-zinc-300'
  }
}

const Pill: React.FC<PillProps> = ({ active = false, type, children, onClick }) => {
  return (
    <button
      role={'button'}
      aria-label={'Toggle columns'}
      onClick={onClick}
      className={`border rounded-sm text-sm flex gap-1 items-center px-1 py-[2px] cursor-pointer hover:bg-zinc-200/60 ${active ? 'bg-zinc-200/80' : 'bg-white'} ${getClassNames(type)}`}
    >
      {active ? <X className="w-4" /> : <Plus className="w-4" />}
      {children}
    </button>
  )
}

export default Pill
