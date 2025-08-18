import fetch from 'node-fetch'

export async function getCisionScript(url: string) {
  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)

    const html = await response.text()

    if (
      html.includes('target-ticker-cision') ||
      html.includes('publish.ne.cision.com')
    ) {
      return 'cision'
    }

    return ''
  } catch (error) {
    console.error(`Error checking Cision script on ${url}:`, error)
    return false
  }
}
