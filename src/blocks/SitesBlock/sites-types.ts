export interface SiteItem {
  id: string
  title: string
  siteService: string
  wpVersion: string
  productionDate: string
  integrations: {repository: string, cloudflare: string, pingdom: string}
  cloudflare: string
  staging: string
  stagingLink: string
  production: string
  createdAt: string
  lastCommitAt: string
  cloudflarePlan: string
  cloudflareRequests: string
  cloudflareBandwidth: number
  cloudflarePercentage: number
  ssl: string
  twoFa: boolean
  hiddenLogin: boolean
  ipRestriction: boolean
  csp: string
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
  speedTestScan: string
  dataProvider: string
  repository: object
  hasSolr: boolean
  hasGoogleAnalytics: string
  cookieProvider: string
  pingdomLink: string | null
  singleClodflareUrl: string | null
  singleClodflareAnalyticsMultipleDays: {
    groupedData: {date: string, requests: string, bandwidth: string, dateTime: string}[]
    totalBandwidth: number
    totalRequests: number
    pathData: {sum: {edgeResponseBytes: number}, dimensions: {clientRequestPath: string}}[]
  }
}

interface ExtraInfo {
  latestWp: string
  phpApiData: {[key: string]: { name: string }}
  wpVersionLatestPercentage: number
  buildTime: string
}

export interface SitesBlockProps {
  sites: SiteItem[]
  extraInfo: ExtraInfo
}
