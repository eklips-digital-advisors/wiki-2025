import fetch from 'node-fetch'

export async function getCookiebot(url: string) {
  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)

    const html = await response.text()

    const hasCookiebot =
      html.includes('https://consent.cookiebot.com/uc.js') ||
      html.includes('<script id="Cookiebot"')

    const hasOneTrust =
      html.includes('https://cdn.cookielaw.org/')

    if (hasCookiebot) return 'Cookiebot'
    if (hasOneTrust) return 'OneTrust'

    return ''
  } catch (error) {
    console.error(`Error checking Cookiebot on ${url}:`, error)
    return false
  }
}
