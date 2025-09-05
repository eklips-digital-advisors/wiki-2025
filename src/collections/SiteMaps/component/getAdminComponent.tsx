import React from 'react'
import { SiteMapEditor } from '@/collections/SiteMaps/component/SiteMapEditor'

export const GetAdminComponent: React.FC = async () => {
  return (
    <>
      <h4 style={{marginBottom: '1rem'}}>Use CTRL + middle mouse button to zoom</h4>
      <SiteMapEditor />
    </>
  )
}
