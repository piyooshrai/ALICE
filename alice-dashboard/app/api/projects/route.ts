import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🟦 Next.js API route - Creating project:', body.name)
    console.log('🟦 Admin key present:', !!process.env.ADMIN_API_KEY)

    // Forward request to alice-server (server-to-server, no CORS issue)
    const response = await fetch('https://alice-server-pvhl.vercel.app/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        admin_key: process.env.ADMIN_API_KEY,
      }),
    })

    console.log('🟦 alice-server response status:', response.status)

    const data = await response.json()
    console.log('🟦 alice-server response data:', data)

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('🔴 Error in API route:', error)
    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
