export default async function getSingleRepo(path: string | number) {
  if (!path) return '';

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
      return
      // throw new Error(`HTTP error!`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching repository data from ${path}:`, error);
    return null; // Return `null` to indicate failure
  }
}
