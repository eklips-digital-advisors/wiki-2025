import fetch from 'node-fetch'

export async function getDataBlocks(url: string) {
  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)

    const html = await response.text()

    const dataBlocks =
      html.includes('module-shareticker-mfn') ||
      html.includes('eda-module-type-shareticker-mfn') ||
      html.includes('target-ticker-mfn') ||
      html.includes('mfn-block') ||
      html.includes('mfn-subscribe') ||
      html.includes('module-mfn')

    if (dataBlocks) return 'Datablocks'

    return ''
  } catch (error) {
    console.error(`Error checking MFN script on ${url}:`, error)
    return false
  }
}
