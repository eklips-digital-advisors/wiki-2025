import React from 'react'
import './index.scss'

import Link from 'next/link'
import { ExternalLinkIcon } from 'lucide-react'

const BeforeDashboard: React.FC = () => {
  return (
    <>
      <Link href="/">
        Visit site
      </Link>
    </>
  )
}

export default BeforeDashboard
