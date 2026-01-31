import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const serverUrl = process.env.ALICE_SERVER_URL || 'https://alice-server-fawn.vercel.app'

    const response = await fetch(`${serverUrl}/api/dashboard`, {
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
    console.error('🔴 Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
