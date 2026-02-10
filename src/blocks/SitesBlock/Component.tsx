import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import getSinglePingdom from '@/utilities/GetPingdomChecks/getSinglePingdom'
import getSingleRepo from '@/utilities/GetRepos/getSingleRepo'
import getDefault from '@/utilities/getDefault'
import { SitesBlockClient } from '@/blocks/SitesBlock/Component.client'
import getHeaders from '@/utilities/getHeaders'
import { getSingleCloudflareItemStats } from '@/utilities/GetCloudflareItems/getSingleCloudflareItemStats'
import { getSingleCloudflareItemSsl } from '@/utilities/GetCloudflareItems/getSingleCloudflareItemSsl'
import { SiteItem } from '@/blocks/SitesBlock/sites-types'
import { Site } from '@/payload-types'
import { checkGoogleAnalytics } from '@/utilities/GetProviders/getGoogleAnalytics'
import { getCookiebot } from '@/utilities/GetProviders/getCookiebot'
import {
  getSingleCloudflareItemStatsMultipleDays
} from '@/utilities/GetCloudflareItems/getSingleCloudflareItemStatsMultipleDays'
import { getCwaasZone } from '@/utilities/GetCloudflareItems/getCwaasZone'
import { toLocaleDateString } from '@/utilities/toLocaleDateString'
import { formatDateTime } from '@/utilities/formatDateTime'
import pLimit from 'p-limit';
import { getSSLCertificate } from '@/utilities/getNodeSsl'
import { getDataBlocks } from '@/utilities/GetProviders/getDataBlocks'
import { getCisionBlocks } from '@/utilities/GetProviders/getCisionBlocks'
import getSingleAzureDevopsItem from '@/utilities/GetAzureDevopsRepos/getSingleAzureDevopsItem'
import getAzureDevopsRepoCommits from '@/utilities/GetAzureDevopsRepos/getAzureDevopsRepoCommits'
import getAzureDevopsFileContents from '@/utilities/GetAzureDevopsRepos/getAzureDevopsFileContents'

type DockerfileVersions = {
  wpVersion: string
  phpVersion: string
}

const parseDockerfileVersions = (contents?: string | null): DockerfileVersions | null => {
  if (!contents) return null
  const match = contents.match(
    /FROM\s+wordpress:([0-9.]+)-php([0-9.]+)-fpm(?:-[\w.-]+)?/i,
  )
  if (!match) return null
  return { wpVersion: match[1], phpVersion: match[2] }
}

export const SitesBlock: React.FC = async () => {
  const buildTime: string = new Date().toLocaleString('et-ET', { timeZone: "Europe/Tallinn" })
  const limit = pLimit(4);

  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch all sites from the 'sites' collection
    const siteLimit = process.env.NODE_ENV !== 'production' ? 6 : 999
    const [sitesResponse] = await Promise.all([
      payload.find({ collection: "sites", limit: siteLimit }),
    ])

    const sites: Site[] = sitesResponse.docs as Site[]
    const cwaasZone = await getCwaasZone()
    const cwaasZonePlan = cwaasZone?.plan?.name || ''
    const hasAzureSites = sites.some((site) => Boolean(site?.integrations?.azureDevops))
    const cwaasDockerfileContents = hasAzureSites
      ? await limit(() =>
          getAzureDevopsFileContents('90981c39-baa3-4fcb-8a84-f5cc650d7b1e', '/Dockerfile.prod'),
        )
      : null
    const cwaasDockerfileVersions = parseDockerfileVersions(cwaasDockerfileContents)

    // Fetch external API data in parallel
    const [wpApiData, phpApiData] = await Promise.all([
      getDefault("https://api.wordpress.org/core/version-check/1.7/"),
      getDefault("https://php.watch/api/v1/versions")
    ])

    const latestWp = wpApiData?.offers?.[0]?.current ?? 'Unknown'
    let wpSitesWithLatestSoftware = 0
    let totalWpsites = 0

    // Fetch data for each site in parallel
    const enrichedSites: Array<SiteItem | null> = await Promise.all(
      sites.map(async (site) => {

        try {
          const siteIntegrationsCloudflare= site?.integrations?.cloudflare
          const singleClodflareSsl = siteIntegrationsCloudflare ? await getSingleCloudflareItemSsl(siteIntegrationsCloudflare) : null
          const singleClodflareAnalytics = siteIntegrationsCloudflare ? await getSingleCloudflareItemStats(siteIntegrationsCloudflare) : null
          const singleClodflareAnalyticsMultipleDays = siteIntegrationsCloudflare
            ? await getSingleCloudflareItemStatsMultipleDays(siteIntegrationsCloudflare)
            : null
          const singleClodflareUrl =
            siteIntegrationsCloudflare && cwaasZone?.owner?.id && cwaasZone?.name
              ? `https://dash.cloudflare.com/${cwaasZone.owner.id}/${cwaasZone.name}/analytics/traffic/data-transfer?host=${encodeURIComponent(
                  siteIntegrationsCloudflare,
                )}`
              : null

          const singlePingdom = site?.integrations?.pingdom ? await getSinglePingdom(site?.integrations?.pingdom) : null
          const prodHostname = singlePingdom?.hostname ?? ""
          const siteUrl = prodHostname ? `https://${prodHostname}` : null;
          const prodFetch = siteUrl ? await getHeaders(siteUrl) : null;

          const sslIssuerOrganization = prodHostname ? await getSSLCertificate(prodHostname) : '';

          const csp = prodFetch ? prodFetch?.get('content-security-policy') : '';

          const hasGoogleAnalytics = siteUrl ? await checkGoogleAnalytics(siteUrl) : '';
          const cookieProvider = siteUrl ? await getCookiebot(siteUrl) : '';
          const hasDataBlocks = siteUrl ? await getDataBlocks(siteUrl) : false;
          const hasCisionBlocks = siteUrl ? await getCisionBlocks(siteUrl) : false;
          const siteIntgrationRepository= site?.integrations?.repository

          const repoPath = siteIntgrationRepository ? `repositories/${siteIntgrationRepository}.json` : null
          const singleRepo = repoPath ? await limit(() => getSingleRepo(repoPath)) : null
          const siteIntegrationAzureDevops = site?.integrations?.azureDevops
          const singleAzureDevops = siteIntegrationAzureDevops
            ? await limit(() => getSingleAzureDevopsItem(siteIntegrationAzureDevops))
            : null
          const azureOldestCommitDate = siteIntegrationAzureDevops
            ? await limit(() =>
                getAzureDevopsRepoCommits(
                  siteIntegrationAzureDevops,
                  singleAzureDevops?.defaultBranch,
                  singleAzureDevops?.project?.name,
                ),
              )
            : null
          const azureCreatedAt = formatDateTime(singleAzureDevops?.project?.lastUpdateTime || '')
          const azureLastCommitAt = formatDateTime(azureOldestCommitDate || '')
          const hasAzureDevops = Boolean(siteIntegrationAzureDevops)
          const azureVersions = hasAzureDevops ? cwaasDockerfileVersions : null
          const azureStaging = hasAzureDevops && singleAzureDevops?.name
            ? `https://${singleAzureDevops.name}.stage.cwaas.site`
            : ''
          const azureStagingLink = hasAzureDevops ? singleAzureDevops?.webUrl || '' : ''

          let singleRepoWpVersionParsed = ''
          let twoFaExists = false
          let hiddenLoginExists = false
          let isCwaas = ''
          let hasSolr = false

          if (siteIntgrationRepository) {
            const twoFaPath = `repositories/${siteIntgrationRepository}/node.json?path=wp-content/plugins/eklips-2fa`
            twoFaExists = await limit(() => getSingleRepo(twoFaPath));

            const hiddenLoginPath = `repositories/${siteIntgrationRepository}/node.json?path=wp-content/plugins/wps-hide-login`
            hiddenLoginExists = await limit(() => getSingleRepo(hiddenLoginPath));

            const cwaasPath = `repositories/${siteIntgrationRepository}/node.json?path=wp-content/themes/cwaas`
            isCwaas = await limit(() => getSingleRepo(cwaasPath)) ? 'CWAAS' : ''

            const loadPhpPath = `repositories/${siteIntgrationRepository}/node.json?path=wp-content/themes/cwaas/framework/load.php&contents=true`
            const loadPhp = await limit(() => getSingleRepo(loadPhpPath));
            if (loadPhp && loadPhp?.contents.includes('box-solr/solr.php')) hasSolr = true

            const versionPath = `repositories/${siteIntgrationRepository}/node.json?path=wp-includes/version.php&contents=true`
            const singleRepoWpVersion = await limit(() => getSingleRepo(versionPath));

            if (singleRepoWpVersion && singleRepoWpVersion.contents) {
                const match = singleRepoWpVersion.contents.match(/\$wp_version\s*=\s*'([^']+)'/);
                if (match) {
                    singleRepoWpVersionParsed = match[1];
                }
            }
          }

          const resolvedWpVersion =
            azureVersions?.wpVersion ||
            singleRepoWpVersionParsed ||
            (prodFetch ? `${prodFetch.get("x-powered-by") ?? ''}` : 'Unknown')
          const resolvedPhpVersion = azureVersions?.phpVersion || site?.phpVersion || ''
          const wpVersionForComparison = azureVersions?.wpVersion || singleRepoWpVersionParsed || ''

          if (wpVersionForComparison) {
            totalWpsites++
            if (wpVersionForComparison === latestWp) wpSitesWithLatestSoftware++
          }

          const siteItem: SiteItem = {
            id: site.id,
            title: site.title,
            ipRestriction: site?.ipRestriction ?? false,
            hosting: site?.hosting || '',
            server: site?.server || '',
            csp: csp ? csp : '',
            wcagUpdated: site?.wcagUpdated || '',
            wcagLevel: site?.wcagLevel || '',
            bsScan: site?.bsScan ? formatDateTime(site?.bsScan) : '',
            phpVersion: resolvedPhpVersion,
            siteService: site?.siteService ?? '',
            production: singlePingdom?.hostname ? `https://${singlePingdom?.hostname}` : '',
            wpVersion: resolvedWpVersion,
            productionDate: singlePingdom?.hostname ? toLocaleDateString(singlePingdom?.created) : '',
            cloudflare: (prodFetch?.get('server') || '').toLowerCase(),
            cloudflarePlan: siteIntegrationsCloudflare ? cwaasZonePlan : '',
            cloudflareRequests:
              typeof singleClodflareAnalytics?.requests === 'number'
                ? singleClodflareAnalytics.requests
                : null,
            cloudflareBandwidth:
              typeof singleClodflareAnalytics?.bandwidth === 'number'
                ? Number(singleClodflareAnalytics.bandwidth.toFixed(2))
                : null,
            cloudflarePercentage:
              typeof singleClodflareAnalytics?.percentageBandWidth === 'number'
                ? Number(singleClodflareAnalytics.percentageBandWidth.toFixed(1))
                : null,
            createdAt: formatDateTime(singleRepo?.repository?.created_at) || azureCreatedAt || '',
            lastCommitAt: formatDateTime(singleRepo?.repository?.last_commit_at) || azureLastCommitAt || '',
            staging: hasAzureDevops
              ? azureStaging
              : singleRepo?.repository?.name
                ? `https://${singleRepo?.repository?.name}.eklipsdevelopment.com`
                : '',
            stagingLink: hasAzureDevops
              ? azureStagingLink
              : singleRepo?.repository?.name
                ? `https://eklips.beanstalkapp.com/${singleRepo?.repository?.name}`
                : '',
            ssl: sslIssuerOrganization || singleClodflareSsl?.certificate_authority || '',
            twoFa: twoFaExists,
            hiddenLogin: hiddenLoginExists,
            framework: site?.framework || isCwaas || '',
            pressReleases: site?.pressReleases || [],
            dataProvider: {cisionBlocks: hasCisionBlocks, dataBlocks: hasDataBlocks},
            lastResponsetime: singlePingdom?.hostname ? Number(singlePingdom?.lastresponsetime) : null,
            pingdomLink: singlePingdom?.hostname ? `https://my.pingdom.com/app/reports/uptime#check=${singlePingdom.id}` : null,
            hasSolr,
            hasGoogleAnalytics,
            cookieProvider,
            singleClodflareUrl,
            singleClodflareAnalyticsMultipleDays,
            fonts: site?.fonts || [],
          }
          return siteItem
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
      phpApiData: phpApiData?.data ?? {},
      wpVersionLatestPercentage: Number(((wpSitesWithLatestSoftware / totalWpsites) * 100).toFixed(1)),
      buildTime
    }

    return <SitesBlockClient sites={validSites} extraInfo={extraInfo} />
  } catch (error) {
    console.error("Error loading SitesBlock:", error)
    return <p>Failed to load site data.</p>
  }
}
