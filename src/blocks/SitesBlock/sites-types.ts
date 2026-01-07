import { Site } from '@/payload-types'

export interface SiteItem {
  id: string
  title: string
  siteService: string
  wpVersion: string
  productionDate: string
  cloudflare: string
  staging: string
  stagingLink: string
  production: string
  createdAt: string
  lastCommitAt: string
  cloudflarePlan: string
  cloudflareRequests: number | null
  cloudflareBandwidth: number | null
  cloudflarePercentage: number | null
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
  lastResponsetime: number | null
  pressReleases: string[]
  fonts: NonNullable<Site['fonts']>
  dataProvider: { cisionBlocks: boolean; dataBlocks: boolean }
  hasSolr: boolean
  hasGoogleAnalytics: string
  cookieProvider: string
  pingdomLink: string | null
  singleClodflareUrl: string | null
  singleClodflareAnalyticsMultipleDays: {
    groupedData: { dateTime: string; requests: number; bandwidth: number }[]
    totalBandwidth: number
    totalRequests: number
    pathData: {
      sum: { edgeResponseBytes: number }
      dimensions: { clientRequestPath: string }
      avg: { edgeTimeToFirstByteMs: number; originResponseDurationMs: number }
    }[]
  } | null
}

interface ExtraInfo {
  latestWp: string
  phpApiData: { [key: string]: { name: string } }
  wpVersionLatestPercentage: number
  buildTime: string
}

export interface SitesBlockProps {
  sites: SiteItem[]
  extraInfo: ExtraInfo
}
