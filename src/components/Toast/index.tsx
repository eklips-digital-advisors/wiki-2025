'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

export const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timeout)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded shadow-md text-white flex items-center gap-2 ${
        type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'
      }`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-auto">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
