export interface SiteItem {
  id: string
  title: string
  'site/service': string
  wpVersion: string
  productionDate: number
  cloudflare: string
  repositoryName: string
  hostname: string
  createdAt: string
  lastCommitAt: string
  cloudflarePlan: string
  cloudflareRequests: string
  cloudflareBandwidth: string
  ssl: string
  twoFa: boolean
  hiddenLogin: boolean
  ipRestriction: boolean
  csp: boolean
  wcagUpdated: string
  wcagLevel: string
  bsScan: string
  phpVersion: string
}

interface ExtraInfo {
  latestWp: string
  phpApiData: string
  wpVersionLatestPercentage: number
}

export interface SitesBlockProps {
  sites: SiteItem[]
  extraInfo: ExtraInfo
}
