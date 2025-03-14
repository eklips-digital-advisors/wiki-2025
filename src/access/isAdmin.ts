import type { Access } from 'payload'
import { User } from '@/payload-types'

export const isAdmin: Access = ({ req }): boolean => {
  return isAdminLevel(req.user)
}

export const isAdminLevel = (user: User | null): boolean => {
  return Boolean(user?.role?.includes('admin'))
}
