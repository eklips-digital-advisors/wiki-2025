import fetch from 'node-fetch'

export async function getMfnScript(url: string) {
  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)

    const html = await response.text()

    // Check for MFN script
    return (
      html.includes('box-mfn/js/mfn.js')
    )
  } catch (error) {
    console.error(`Error checking MFN script on ${url}:`, error)
    return false
  }
}
