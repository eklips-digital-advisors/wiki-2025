import React from 'react'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import { CircleUserRound } from 'lucide-react'

const AdminUserProfileImage: React.FC = async () => {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const result = await payload.auth({ headers })

  const user = result ? result?.user : null
  const src = typeof user?.media === 'object' ? user?.media?.sizes?.icon?.url : undefined;

  return user && src ? (
    <div style={{position: 'relative', width: '32px', height: '32px'}}>
      <Image
        src={src}
        alt="Avatas image"
        style={{ borderRadius: '50%', objectFit: 'cover' }}
        fill
        sizes="32px"
      />
    </div>
  ) : (
    <CircleUserRound style={{strokeWidth: '1px', width: '32px', height: '32px'}} />
  )
}

export default AdminUserProfileImage
