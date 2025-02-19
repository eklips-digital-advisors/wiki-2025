export default async function getSingleRepo(path: string | number) {
  if (!path) return '';

  console.log(`waiting for 0.2 seconds...`);
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const auth = Buffer.from(
      `${process.env.BEANSTALK_USR}:${process.env.BEANSTALK_PWD}`
    ).toString('base64');

    const headers = {
      Authorization: `Basic ${auth}`,
      ContentType: 'application/json',
      UserAgent: 'Wiki',
    };

    const url = `${process.env.BEANSTALK_URL}${path}`;

    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching repository data from ${path}:`, error);
    return null; // Return `null` to indicate failure
  }
}
