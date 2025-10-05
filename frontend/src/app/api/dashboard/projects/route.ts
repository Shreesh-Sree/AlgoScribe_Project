import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProjectService, DocumentationService } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await ProjectService.getUserProjects(session.user.id)
    
    // Get documentation count for each project
    const formattedProjects = await Promise.all(
      projects.map(async (project) => {
        const docs = await DocumentationService.getProjectDocumentation(project.id)
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          createdAt: project.createdAt.toDate().toISOString(),
          docsCount: docs.length
        }
      })
    )

    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
