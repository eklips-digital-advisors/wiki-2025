import { NextResponse } from 'next/server'
import { readdirSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  const reportsPath = path.join(process.cwd(), 'public', 'reports')

  try {
    const entries = readdirSync(reportsPath, { withFileTypes: true })

    const folders = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)

    return NextResponse.json({ folders })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 })
  }
}
