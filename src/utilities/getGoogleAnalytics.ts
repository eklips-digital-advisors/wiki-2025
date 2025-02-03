import fetch from 'node-fetch'

export async function checkGoogleAnalytics(url: string) {
  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)

    const html = await response.text()

    // Check for Google Analytics tracking codes
    return (
      html.includes('www.googletagmanager.com/gtag/js') || // GA4
      html.includes('www.google-analytics.com/analytics.js') || // Universal Analytics
      html.includes('window.dataLayer') || // Google Tag Manager
      html.includes('gtag(') ||
      html.includes('_gaq.push')
    )
  } catch (error) {
    console.error(`Error checking Google Analytics on ${url}:`, error)
    return false
  }
}
