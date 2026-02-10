type PhpVersionInfo = {
  name?: string
  activeSupportEndDate?: string | null
  isSecureVersion?: boolean
  isEOLVersion?: boolean
  isFutureVersion?: boolean
}

type PhpSupportState =
  | 'active-support'
  | 'security-only'
  | 'future'
  | 'eol'
  | 'unknown'

type PhpSupportInfo = {
  state: PhpSupportState
  backgroundClass: string
  label: string
}

const getMajorMinor = (version: string): string | null => {
  const match = version.match(/(\d+)\.(\d+)/)
  return match ? `${match[1]}.${match[2]}` : null
}

const isActiveSupport = (activeSupportEndDate?: string | null): boolean => {
  if (!activeSupportEndDate) return false

  const end = new Date(`${activeSupportEndDate}T23:59:59Z`)
  return !Number.isNaN(end.getTime()) && new Date() <= end
}

const getSupportInfoFromState = (
  state: PhpSupportState,
): PhpSupportInfo => {
  switch (state) {
    case 'active-support':
      return {
        state,
        backgroundClass: 'bg-emerald-100',
        label: 'Active support',
      }
    case 'security-only':
      return {
        state,
        backgroundClass: 'bg-yellow-100',
        label: 'Security fixes only',
      }
    case 'future':
      return {
        state,
        backgroundClass: 'bg-yellow-100',
        label: 'Future PHP version',
      }
    case 'eol':
      return {
        state,
        backgroundClass: 'bg-rose-100',
        label: 'End of life',
      }
    default:
      return {
        state: 'unknown',
        backgroundClass: 'bg-rose-100',
        label: 'Support status unknown',
      }
  }
}

export const getPhpSupportInfo = (
  data: Record<string, PhpVersionInfo> | null | undefined,
  searchString: string,
): PhpSupportInfo => {
  if (!searchString || !data) {
    return getSupportInfoFromState('unknown')
  }

  const normalizedVersion = getMajorMinor(searchString)
  if (!normalizedVersion) {
    return getSupportInfoFromState('unknown')
  }

  const matchedVersion = Object.values(data).find(
    (item) => item.name === normalizedVersion,
  )

  if (!matchedVersion || matchedVersion.isEOLVersion) {
    return getSupportInfoFromState('eol')
  }

  if (matchedVersion.isFutureVersion) {
    return getSupportInfoFromState('future')
  }

  if (isActiveSupport(matchedVersion.activeSupportEndDate)) {
    return getSupportInfoFromState('active-support')
  }

  if (matchedVersion.isSecureVersion) {
    return getSupportInfoFromState('security-only')
  }

  return getSupportInfoFromState('unknown')
}

export const getPhpBackground = (
  data: Record<string, PhpVersionInfo> | null | undefined,
  searchString: string,
): string => {
  return getPhpSupportInfo(data, searchString).backgroundClass
}
