import React, { ReactElement, ReactNode } from 'react'
import "./styles.css"

interface LayoutProps {
  children?: ReactNode
}

export default function Layout({ children }: LayoutProps): ReactElement {
  return (
    <html>
    <body>
    <main>{children}</main>
    </body>
    </html>
  )
}
