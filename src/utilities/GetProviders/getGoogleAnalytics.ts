import fetch from 'node-fetch'

export async function checkGoogleAnalytics(url: string): Promise<string> {
  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)

    const html = await response.text()

    const analytics = html.includes('google-analytics.com')
    const tagManager = html.includes('googletagmanager.com')

    if (tagManager && analytics) return 'Google TagManager, Google Analytics'
    if (analytics) return 'Google Analytics'
    if (tagManager) return 'Google TagManager'

    return ''
  } catch (error) {
    console.error(`Error checking Google Analytics on ${url}:`, error)
    return ''
  }
}
