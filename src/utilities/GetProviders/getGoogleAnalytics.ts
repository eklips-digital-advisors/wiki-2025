import fetch from 'node-fetch'

export async function checkGoogleAnalytics(url: string) {
  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)

    const html = await response.text()

    // Check for Google Analytics tracking codes
    return (
      html.includes('https://www.googletagmanager.com/gtm.js?id=')
    )
  } catch (error) {
    console.error(`Error checking Google Analytics on ${url}:`, error)
    return false
  }
}
