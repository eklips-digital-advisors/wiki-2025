import React from 'react'
import './index.scss'

import Link from 'next/link'
import { ExternalLinkIcon } from 'lucide-react'

const BeforeDashboard: React.FC = () => {
  return (
    <>
      <Link href="/" target="_blank">
        <ExternalLinkIcon />
      </Link>
    </>
  )
}

export default BeforeDashboard
