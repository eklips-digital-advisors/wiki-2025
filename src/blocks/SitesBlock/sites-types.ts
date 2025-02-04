export interface SiteItem {
  id: string
  title: string
  'site/service': string
  wpVersion: string
  productionDate: number
  integrations: {repository: string, cloudflare: string, pingdom: string}
  cloudflare: string
  repositoryName: string
  hostname: string
  createdAt: string
  lastCommitAt: string
  cloudflarePlan: string
  cloudflareRequests: string
  cloudflareBandwidth: number
  ssl: string
  twoFa: boolean
  hiddenLogin: boolean
  ipRestriction: boolean
  csp: boolean
  framework: string
  wcagUpdated: string
  wcagLevel: string
  bsScan: string
  phpVersion: string
  server: string
  hosting: string
  lastResponsetime: number
  publishedAt?: string | null
  slug?: string | null
  slugLock?: boolean | null
  updatedAt: string
  pingdom: string
  pressReleases: {cision: boolean, mfn: boolean}
  newsFeeds: string
  speedTestScan: string
  dataBlocks: string
  repository: object
  hasSolr: boolean
  hasGoogleAnalytics: boolean
  hasCookiebot: boolean
}

interface ExtraInfo {
  latestWp: string
  phpApiData: {[key: string]: { name: string }}
  wpVersionLatestPercentage: number
}

export interface SitesBlockProps {
  sites: SiteItem[]
  extraInfo: ExtraInfo
}
