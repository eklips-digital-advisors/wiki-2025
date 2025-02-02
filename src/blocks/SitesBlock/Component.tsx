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

export const SitesBlock: React.FC = async () => {
  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch all sites from the 'sites' collection
    const [sitesResponse, totalSites] = await Promise.all([
      payload.find({ collection: "sites" }),
      payload.count({ collection: "sites" })
    ])

    const sites = sitesResponse.docs

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
      sites.map(async (site: any) => {
        // console.log('site', site)
        
        try {
          const singleClodflare = site?.cloudflare ? await getSingleCloudflareItem(site.cloudflare) : null
          const singleClodflareSsl = site?.cloudflare ? await getSingleCloudflareItemSsl(site.cloudflare) : null
          const singleClodflareAnalytics = site?.cloudflare ? await getSingleCloudflareItemStats(site.cloudflare) : null
          
          const singlePingdom = site?.pingdom ? await getSinglePingdom(site.pingdom) : null
          const prodHostname = singlePingdom?.hostname ?? ""
          const prodFetch = await getHeaders(`https://${prodHostname}`)
          
          const repoPath = site?.repository ? `repositories/${site.repository}.json` : null
          const singleRepo = repoPath ? await getSingleRepo(repoPath) : null

          let singleRepoWpVersionParsed = null
          let twoFaExists = false
          let hiddenLoginExists = false

          if (site?.repository) {
            const twoFaPath = `repositories/${site.repository}/node.json?path=wp-content/plugins/eklips-2fa`
            twoFaExists = await getSingleRepo(twoFaPath)

            const hiddenLoginPath = `repositories/${site.repository}/node.json?path=wp-content/plugins/wps-hide-login`
            hiddenLoginExists = await getSingleRepo(hiddenLoginPath)

            const versionPath = `repositories/${site.repository}/node.json?path=wp-includes/version.php&contents=true`
            const singleRepoWpVersion = await getSingleRepo(versionPath)

            singleRepoWpVersionParsed = singleRepoWpVersion?.contents?.match(/\$wp_version\s*=\s*'([^']+)'/)?.[1] ?? null

            if (singleRepoWpVersionParsed === latestWp) wpSitesWithLatestSoftware++
            if (repoPath) totalWpsites++
          }

          return {
            id: site.id,
            title: site.title,
            ipRestriction: site?.ipRestriction,
            csp: site?.csp,
            wcagUpdated: site?.wcagUpdated,
            wcagLevel: site?.wcagLevel,
            bsScan: site?.bsScan,
            phpVersion: site?.phpVersion,
            "site/service": site["site/service"] ?? '',
            hostname: singlePingdom?.hostname,
            wpVersion: singleRepoWpVersionParsed || `Non WP (${prodFetch.get("x-powered-by") ?? ''})`,
            productionDate: singlePingdom?.created || '',
            cloudflare: prodFetch.get('server')?.toLowerCase(),
            cloudflarePlan: singleClodflare?.result?.plan?.name,
            cloudflareRequests: singleClodflareAnalytics?.requests,
            cloudflareBandwidth: singleClodflareAnalytics?.bandwidth.toFixed(2),
            createdAt: singleRepo?.repository?.created_at || '',
            lastCommitAt: singleRepo?.repository?.last_commit_at || '',
            repositoryName: singleRepo?.repository?.name || '',
            ssl: singleClodflareSsl?.result[0]?.certificate_authority || '',
            twoFa: twoFaExists,
            hiddenLogin: hiddenLoginExists,
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
      phpApiData,
      wpVersionLatestPercentage: Number(((wpSitesWithLatestSoftware / totalWpsites) * 100).toFixed(1)),
    }

    return <SitesBlockClient sites={validSites} extraInfo={extraInfo} />
  } catch (error) {
    console.error("Error loading SitesBlock:", error)
    return <p>Failed to load site data.</p>
  }
}
