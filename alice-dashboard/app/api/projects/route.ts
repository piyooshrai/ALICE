import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const serverUrl = process.env.ALICE_SERVER_URL || 'https://alice-server-fawn.vercel.app'

    // Forward request to alice-server to get all projects
    const response = await fetch(`${serverUrl}/api/projects?admin_key=${process.env.ADMIN_API_KEY}`, {
      method: 'GET',
      headers: {
        'X-Admin-Key': process.env.ADMIN_API_KEY || '',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('🔴 Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🟦 Next.js API route - Creating project:', body.name)
    console.log('🟦 Admin key present:', !!process.env.ADMIN_API_KEY)

    const serverUrl = process.env.ALICE_SERVER_URL || 'https://alice-server-fawn.vercel.app'
    console.log('🟦 Server URL:', serverUrl)

    // Forward request to alice-server (server-to-server, no CORS issue)
    const response = await fetch(`${serverUrl}/api/projects`, {
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }

    const serverUrl = process.env.ALICE_SERVER_URL || 'https://alice-server-fawn.vercel.app'

    const response = await fetch(`${serverUrl}/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-Key': process.env.ADMIN_API_KEY || '',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('🔴 Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
