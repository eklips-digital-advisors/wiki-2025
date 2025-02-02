export default async function getDefault(url: string) {
  if (!url) return '';

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    return null; // Return `null` to indicate failure
  }
}
