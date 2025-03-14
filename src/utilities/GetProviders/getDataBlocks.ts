import fetch from 'node-fetch';

export async function getDataBlocks(baseUrl: string) {
  try {
    const pathConditions = [
      { path: '/sv/investerare/aktieinformation/', domains: ['corporate.alimakgroup.com'] },
      { path: '/en/investors/stock-information/', domains: ['corporate.alimakgroup.com'] },
      { path: '/sv/aktien/', domains: [] },
      { path: '/en/the-share/', domains: [] },
      { path: '/sv/investerare/aktien/aktiekurs/', domains: ['www.bernerindustrier.se'] },
      { path: '/en/investors/the-share/share-price/', domains: ['www.bernerindustrier.se'] },
      { path: '/sv/investerare/aktien/', domains: [] },
      { path: '/en/share-price-and-trading-371/', domains: ['www.electroluxgroup.com'] },
      { path: '/sv/aktiekurs-9420/', domains: ['www.electroluxgroup.com'] },
      { path: '/en/investors/the-share/', domains: [] },
      { path: '/sv/aktien-1860/', domains: ['logistea.se'] },
      { path: '/en/the-share-1739/', domains: ['logistea.se'] },
      { path: '/en/investor-relations/the-nyfosa-share/', domains: ['nyfosa.se'] },
      { path: '/en/investor-relations/the-share/', domains: [] },
      { path: '/sv/investor-relations/aktien/', domains: [] },
      { path: '/sv/aktiekursinformation/', domains: ['corporate.sbbnorden.se'] },
      { path: '/en/share-information/', domains: ['corporate.sbbnorden.se'] },
      { path: '/sv/investerare/aktiedata/', domains: ['www.storytelgroup.com'] },
      { path: '/en/investors/share-price-development/', domains: ['synactpharma.com'] },
      { path: '/sv/investerare/aktiekursutveckling/', domains: ['synactpharma.com'] },
    ];

    const baseDomain = new URL(baseUrl).hostname;

    const fetchPromises = pathConditions
      .filter(({ domains }) => domains.length === 0 || domains.includes(baseDomain))
      .map(async ({ path }) => {
        const url = new URL(path, baseUrl).href;
        try {
          const response = await fetch(url, { method: 'GET', redirect: 'manual' });

          if (response.status >= 300 && response.status < 400) {
            console.warn(`Skipping ${url} due to redirect (status: ${response.status})`);
            return false; // Skip checking this URL if it's a redirect
          }

          if (!response.ok) {
            console.warn(`Failed to fetch ${url}: ${response.status}`);
            return false;
          }

          const html = await response.text();
          return (
            html.includes('mf_stockChart') ||
            html.includes('stock-chart') ||
            html.includes('mfn-stock-chart')
          );
        } catch (error) {
          console.error(`Error checking MFN script on ${url}:`, error);
          return false;
        }
      });

    const results = await Promise.all(fetchPromises);

    return results.includes(true);
  } catch (error) {
    console.error(`Unexpected error in getDataBlocks:`, error);
    return false;
  }
}
