export async function getSingleCloudflareItemSsl(path: string | number) {
  if (!path) return '';

  try {
    if (!process.env.CLOUDFLARE_EKLIPS) {
      throw new Error('CLOUDFLARE_EKLIPS is not set in environment variables.')
    }

    const headers = {
      Authorization: `Bearer ${process.env.CLOUDFLARE_EKLIPS}`,
      ContentType: 'application/json',
    }

    const url = `https://api.cloudflare.com/client/v4/zones/${path}/ssl/certificate_packs?status=all`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching Cloudflare data from ${path}:`, error);
    return null; // Return `null` to indicate failure
  }
}
