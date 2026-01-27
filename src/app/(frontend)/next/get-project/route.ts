import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const API_KEY = process.env.TEAMWORK_API_KEY
  const BASE_URL = process.env.TEAMWORK_BASE_URL
  type TeamworkProjectResponse = { project?: unknown }

  if (!API_KEY || !BASE_URL) {
    return new Response(
      JSON.stringify({ error: 'Missing TEAMWORK_API_KEY or TEAMWORK_BASE_URL' }),
      { status: 500 }
    )
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing project ID' }), { status: 400 })
  }

  const API_URL = `${BASE_URL}/projects/api/v3/projects/${id}.json`

  try {
    const headers = {
      Authorization: `Basic ${Buffer.from(`${API_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(API_URL, { headers })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = (await response.json()) as TeamworkProjectResponse
    const project = data?.project

    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 })
    }

    return new Response(JSON.stringify(project), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Failed to fetch project data:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch project data' }), {
      status: 500,
    })
  }
}
