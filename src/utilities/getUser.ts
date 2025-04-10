import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'

export const getUser = async () => {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    return { user, payload }
  } catch (error) {
    console.error(error)
    return { user: null, payload: null }
  }
}
