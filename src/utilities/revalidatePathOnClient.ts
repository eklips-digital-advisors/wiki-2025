export const revalidatePathOnClient = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch('/next/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    })

    if (!response.ok) {
      console.error('Revalidation failed:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Revalidation error:', error)
    return false
  }
}
