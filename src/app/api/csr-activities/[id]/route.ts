import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findCSRActivityById } from '@/infrastructure/repositories/social.repository'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const { id } = await params
    const activity = await findCSRActivityById(id)
    if (!activity) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'CSR activity not found' } }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: activity })
  } catch (error) {
    console.error('CSR activity detail error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch activity' } }, { status: 500 })
  }
}
