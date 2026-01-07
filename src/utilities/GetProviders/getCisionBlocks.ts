import fetch from 'node-fetch';

export async function getCisionBlocks(baseUrl: string) {
  try {
    const paths = [
      '/sv/aktien/',
      '/en/the-share/',
      '/en/investors/the-share/',
      '/sv/investerare/aktien/',
    ];

    const fetchPromises = paths.map(async (path) => {
      const url = new URL(path, baseUrl).href;
      try {
        const response = await fetch(url, { method: 'GET', redirect: 'manual' });

          if (response.status >= 300 && response.status < 400) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`Skipping ${url} due to redirect (status: ${response.status})`);
            }
            return false; // Skip checking this URL if it's a redirect
          }

          if (!response.ok) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`Failed to fetch ${url}: ${response.status}`);
            }
            return false;
          }

        const html = await response.text();
        return (
          html.includes('sharegraph-container') ||
          html.includes('target-sharegraph-wrapper')
        );
      } catch (error) {
        console.error(`Error checking MFN script on ${url}:`, error);
        return false;
      }
    });

    const results = await Promise.all(fetchPromises);

    return results.includes(true);
  } catch (error) {
    console.error(`Unexpected error in getCisionBlocks:`, error);
    return false;
  }
}
