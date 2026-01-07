export default async function getSingleRepo(
  path: string | number,
  retries: number = 3,
  delay: number = 2000
): Promise<any | null> {
  if (!path) return '';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const auth = Buffer.from(
        `${process.env.BEANSTALK_USR}:${process.env.BEANSTALK_PWD}`
      ).toString('base64');

      const headers: HeadersInit = {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Wiki',
      };

      const url: string = `${process.env.BEANSTALK_URL}${path}`;
      const response: Response = await fetch(url, { headers });

      if (response.status === 429) {
        // Rate limit hit, wait and retry
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Rate limit hit (attempt ${attempt}). Retrying in ${delay}ms...`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff (2s → 4s → 8s → etc.)
        continue;
      }

      if (!response.ok) {
        console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching repository data from ${path} (attempt ${attempt}):`, error);
    }
  }

  console.error(`Failed to fetch ${path} after ${retries} retries.`);
  return null; // Return `null` after max retries
}
