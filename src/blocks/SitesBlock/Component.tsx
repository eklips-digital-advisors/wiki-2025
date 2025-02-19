import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import getSinglePingdom from '@/utilities/GetPingdomChecks/getSinglePingdom'
import getSingleRepo from '@/utilities/GetRepos/getSingleRepo'
import getDefault from '@/utilities/getDefault'
import { SitesBlockClient } from '@/blocks/SitesBlock/Component.client'
import getHeaders from '@/utilities/getHeaders'
import { getSingleCloudflareItem } from '@/utilities/GetCloudflareItems/getSingleCloudflareItem'
import { getSingleCloudflareItemStats } from '@/utilities/GetCloudflareItems/getSingleCloudflareItemStats'
import { getSingleCloudflareItemSsl } from '@/utilities/GetCloudflareItems/getSingleCloudflareItemSsl'
import { SiteItem } from '@/blocks/SitesBlock/sites-types'
import { checkGoogleAnalytics } from '@/utilities/getGoogleAnalytics'
import { getCookiebot } from '@/utilities/getCookiebot'
import { getMfnScript } from '@/utilities/getMfnScript'
import { getCisionScript } from '@/utilities/getCisionScript'
import {
  getSingleCloudflareItemStatsMultipleDays
} from '@/utilities/GetCloudflareItems/getSingleCloudflareItemStatsMultipleDays'
import { toLocaleDateString } from '@/utilities/toLocaleDateString'
import { formatDateTime } from '@/utilities/formatDateTime'
import { promiseDelay } from '@/utilities/promiseDelay'

export const SitesBlock: React.FC = async () => {
  const buildTime: string = new Date().toLocaleString('et-ET')
  
  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch all sites from the 'sites' collection
    const [sitesResponse] = await Promise.all([
      payload.find({ collection: "sites", limit: 150 }),
    ])

    const sites: SiteItem[] = sitesResponse.docs as SiteItem[]

    // Fetch external API data in parallel
    const [wpApiData, phpApiData] = await Promise.all([
      getDefault("https://api.wordpress.org/core/version-check/1.7/"),
      getDefault("https://php.watch/api/v1/versions/supported")
    ])

    const latestWp = wpApiData?.offers?.[0]?.current ?? 'Unknown'
    let wpSitesWithLatestSoftware = 0
    let totalWpsites = 0

    // Fetch data for each site in parallel
    const enrichedSites = await Promise.all(
      sites.map(async (site) => {
        
        try {
          const siteIntegrationsCloudflare= site?.integrations?.cloudflare
          const singleClodflare = siteIntegrationsCloudflare ? await getSingleCloudflareItem(siteIntegrationsCloudflare) : null
          const singleClodflareSsl = siteIntegrationsCloudflare ? await getSingleCloudflareItemSsl(siteIntegrationsCloudflare) : null
          const singleClodflareAnalytics = siteIntegrationsCloudflare ? await getSingleCloudflareItemStats(siteIntegrationsCloudflare) : null
          const singleClodflareAnalyticsMultipleDays = siteIntegrationsCloudflare ? await getSingleCloudflareItemStatsMultipleDays(siteIntegrationsCloudflare) : null
          const singleClodflareUrl = singleClodflare?.result?.name && singleClodflare?.result?.owner?.id ? `https://dash.cloudflare.com/${singleClodflare?.result?.owner?.id}/${singleClodflare?.result?.name}` : null

          const singlePingdom = site?.integrations?.pingdom ? await getSinglePingdom(site?.integrations?.pingdom) : null
          const prodHostname = singlePingdom?.hostname ?? ""
          const siteUrl = prodHostname ? `https://${prodHostname}${singlePingdom?.type?.http?.url ?? ""}` : null;
          const prodFetch = siteUrl ? await getHeaders(siteUrl) : null;

          const csp = prodFetch ? prodFetch?.get('content-security-policy') : '';

          const hasGoogleAnalytics = siteUrl ? await checkGoogleAnalytics(siteUrl) : false;
          const hasCookiebot = siteUrl ? await getCookiebot(siteUrl) : false;
          const hasMfnScript = siteUrl ? await getMfnScript(siteUrl) : false;
          const hasCisionScript = siteUrl ? await getCisionScript(siteUrl) : false;
          const siteIntgrationRepository= site?.integrations?.repository

          const repoPath = siteIntgrationRepository ? `repositories/${siteIntgrationRepository}.json` : null
          const singleRepo = repoPath ? await getSingleRepo(repoPath) : null

          let singleRepoWpVersionParsed = ''
          let twoFaExists = false
          let hiddenLoginExists = false
          let isCwaas = null
          let hasSolr = false

          if (siteIntgrationRepository) {
            const twoFaPath = `repositories/${siteIntgrationRepository}/node.json?path=wp-content/plugins/eklips-2fa`
            twoFaExists = await getSingleRepo(twoFaPath)
            await promiseDelay(2000)

            const hiddenLoginPath = `repositories/${siteIntgrationRepository}/node.json?path=wp-content/plugins/wps-hide-login`
            hiddenLoginExists = await getSingleRepo(hiddenLoginPath)
            await promiseDelay(2000)

            const cwaasPath = `repositories/${siteIntgrationRepository}/node.json?path=wp-content/themes/cwaas`
            isCwaas = await getSingleRepo(cwaasPath) ? 'CWAAS' : null
            await promiseDelay(2000)

            const loadPhpPath = `repositories/${siteIntgrationRepository}/node.json?path=wp-content/themes/cwaas/framework/load.php&contents=true`
            const loadPhp = await getSingleRepo(loadPhpPath)
            if (loadPhp && loadPhp?.contents.includes('box-solr/solr.php')) hasSolr = true
            await promiseDelay(2000)

            const versionPath = `repositories/${siteIntgrationRepository}/node.json?path=wp-includes/version.php&contents=true`
            const singleRepoWpVersion = await getSingleRepo(versionPath)
            await promiseDelay(2000)

            if (singleRepoWpVersion && singleRepoWpVersion.contents) {
                const match = singleRepoWpVersion.contents.match(/\$wp_version\s*=\s*'([^']+)'/);
                if (match) {
                    singleRepoWpVersionParsed = match[1];
                }
            }

            if (singleRepoWpVersionParsed === latestWp) wpSitesWithLatestSoftware++
            if (repoPath) totalWpsites++
          }

          return {
            id: site.id,
            title: site.title,
            ipRestriction: site?.ipRestriction,
            hosting: site?.hosting,
            server: site?.server,
            csp: csp ? csp : '',
            wcagUpdated: site?.wcagUpdated,
            wcagLevel: site?.wcagLevel,
            bsScan: site?.bsScan ? formatDateTime(site?.bsScan) : '',
            phpVersion: site?.phpVersion,
            siteService: site?.siteService ?? '',
            production: singlePingdom?.hostname ? `https://${singlePingdom?.hostname + singlePingdom?.type?.http?.url}` : '',
            wpVersion: singleRepoWpVersionParsed || (prodFetch ? `Non WP (${prodFetch.get("x-powered-by") ?? ''})` : 'Unknown'),
            productionDate: singlePingdom?.hostname ? toLocaleDateString(singlePingdom?.created) : '',
            cloudflare: prodFetch ? prodFetch?.get('server')?.toLowerCase() : '',
            cloudflarePlan: singleClodflare?.result?.plan?.name,
            cloudflareRequests: singleClodflareAnalytics?.requests ? singleClodflareAnalytics?.requests : null,
            cloudflareBandwidth: singleClodflareAnalytics?.bandwidth ? Number(singleClodflareAnalytics?.bandwidth.toFixed(2)) : null,
            cloudflarePercentage: singleClodflareAnalytics?.percentageBandWidth ? Number(singleClodflareAnalytics?.percentageBandWidth.toFixed(1)) : null,
            createdAt: formatDateTime(singleRepo?.repository?.created_at) || '',
            lastCommitAt: formatDateTime(singleRepo?.repository?.last_commit_at) || '',
            staging: singleRepo?.repository?.name ? `https://${singleRepo?.repository?.name}.eklipsdevelopment.com` : '',
            ssl: singleClodflareSsl?.result[0]?.certificate_authority || '',
            twoFa: twoFaExists,
            hiddenLogin: hiddenLoginExists,
            framework: site?.framework ? site?.framework : isCwaas,
            pressReleases: {cision: hasCisionScript, mfn: hasMfnScript},
            newsFeeds: site?.newsFeeds,
            dataProvider: site?.dataProvider,
            lastResponsetime: singlePingdom?.hostname ? Number(singlePingdom?.lastresponsetime) : '',
            pingdomLink: singlePingdom?.hostname ? `https://my.pingdom.com/app/reports/uptime#check=${singlePingdom.id}` : null,
            hasSolr,
            hasGoogleAnalytics,
            hasCookiebot,
            singleClodflareAnalyticsMultipleDays,
            singleClodflareUrl
          }
        } catch (error) {
          console.error(`Error processing site ${site.id}:`, error)
          return null // Skip site if it fails
        }
      })
    )

    // Remove failed sites
    const validSites: SiteItem[] = enrichedSites.filter((site): site is SiteItem => site !== null);

    const extraInfo = {
      latestWp,
      phpApiData: phpApiData?.data,
      wpVersionLatestPercentage: Number(((wpSitesWithLatestSoftware / totalWpsites) * 100).toFixed(1)),
      buildTime
    }

    return <SitesBlockClient sites={validSites} extraInfo={extraInfo} />
  } catch (error) {
    console.error("Error loading SitesBlock:", error)
    return <p>Failed to load site data.</p>
  }
}
