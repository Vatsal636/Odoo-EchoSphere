import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findChallengeById } from '@/infrastructure/repositories/gamification.repository'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const { id } = await params
    const challenge = await findChallengeById(id)
    if (!challenge) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Challenge not found' } }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: challenge })
  } catch (error) {
    console.error('Challenge detail error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch challenge' } }, { status: 500 })
  }
}
