import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  try {
    type RevalidateBody = { path?: unknown }
    const { path } = (await req.json()) as RevalidateBody

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 })
    }

    console.log('Revalidating path:', path)
    revalidatePath(path)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
