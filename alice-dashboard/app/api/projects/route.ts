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
    console.log('🟦 alice-server response headers:', response.headers.get('content-type'))

    // Get response as text first to handle non-JSON responses
    const responseText = await response.text()
    console.log('🟦 alice-server response text (first 500 chars):', responseText.substring(0, 500))

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      // If it's not JSON, it's likely an HTML error page from Vercel
      console.error('🔴 alice-server returned non-JSON response')
      return NextResponse.json(
        {
          error: 'alice-server deployment error',
          details: 'Server returned HTML instead of JSON',
          html_preview: responseText.substring(0, 1000)
        },
        { status: 500 }
      )
    }

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
