import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UsageService, DocumentationService } from '@/lib/firestore'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, language } = await request.json()

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: code and language' },
        { status: 400 }
      )
    }

    // No usage limits for college project

    // Call the Go backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    
    const response = await fetch(`${backendUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()

    // Track simple usage
    await UsageService.trackUsage({
      userId: session.user.id,
      language: language
    })

    // Save to documentation history
    await DocumentationService.saveDocumentation({
      userId: session.user.id,
      originalCode: code,
      generatedDocumentation: data.documentation,
      language: language,
      aiModel: 'gpt-4'
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
