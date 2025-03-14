import React from 'react'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getUserImage } from '@/utilities/GetTeamwork/getUserImage'
import Image from 'next/image'
import { CircleUserRound } from 'lucide-react'

const AdminUserProfileImage: React.FC = async () => {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const result = await payload.auth({ headers })

  const user = result ? await getUserImage(result?.user?.email) : null

  return user ? (
    <Image
      src={user['avatar-url']}
      alt="Avatas image"
      style={{ borderRadius: '50%' }}
      width={48}
      height={48}
    />
  ) : (
    <CircleUserRound style={{strokeWidth: '1px', width: '32px', height: '32px'}} />
  )
}

export default AdminUserProfileImage
