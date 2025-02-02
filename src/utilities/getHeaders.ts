export default async function getHeaders(url: string): Promise<Headers> {
  try {
    const response = await fetch(url);
    return response.headers; // ✅ Always return Headers
  } catch (error) {
    console.error("Error fetching headers:", error);
    return new Headers(); // ✅ Return an empty Headers object instead of ''
  }
}
