import type { Access } from 'payload'
import { User } from '@/payload-types'

export const isAdmin: Access = ({ req }): boolean => {
  return isAdminLevel(req.user)
}

export const isAdminLevel = (user: User | null): boolean => {
  return Boolean(user?.role?.includes('admin'))
}

export const isEditor: Access = ({ req }): boolean => {
  return isEditorLevel(req.user)
}

export const isEditorLevel = (user: User | null): boolean => {
  return Boolean(user?.role?.includes('editor'))
}

export const isAdminOrEditorLevel = (user: User | null): boolean => {
  return Boolean(user?.role?.includes('admin') || user?.role?.includes('editor'))
}
