export default async function getSinglePingdom(id: string | number) {
  if (!id) return '';

  try {
    const headers = {
      authorization: `Bearer ${process.env.PINGDOM_TOKEN}`,
    };

    const url = `${process.env.PINGDOM_URL}/${id}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data?.check || null; // Return `null` if `data.check` is missing
  } catch (error) {
    console.error(`Error fetching Pingdom check for ID ${id}:`, error);
    return null; // Return `null` on error
  }
}
