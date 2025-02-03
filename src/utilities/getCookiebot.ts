import fetch from 'node-fetch'

export async function getCookiebot(url: string) {
  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)

    const html = await response.text()

    // Check for Cookiebot script
    return (
      html.includes('https://consent.cookiebot.com/uc.js') ||
      html.includes('<script id="Cookiebot"')
    )
  } catch (error) {
    console.error(`Error checking Cookiebot on ${url}:`, error)
    return false
  }
}
