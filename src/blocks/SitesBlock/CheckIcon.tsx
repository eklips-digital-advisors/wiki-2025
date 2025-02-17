import React from 'react'
import { Check, X } from 'lucide-react'

const CheckIcon = ({condition}: {condition: boolean}) => {
  return condition ? <Check className="w-4" /> : <X className="w-4" />
}

export default CheckIcon
