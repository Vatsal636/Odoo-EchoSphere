import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createChallengeParticipation, findChallengeParticipation, updateChallengeParticipation, findChallengeById } from '@/infrastructure/repositories/gamification.repository'
import { createNotification } from '@/infrastructure/notifications/notifier'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    if (session.user.role === 'ADMIN') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admins cannot participate in challenges' } }, { status: 403 })
    }

    const { id } = await params

    const challenge = await findChallengeById(id)
    if (!challenge) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Challenge not found' } }, { status: 404 })
    }

    if (challenge.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: { code: 'UNPROCESSABLE', message: 'Challenge is not active' } }, { status: 422 })
    }

    const existing = await findChallengeParticipation(session.user.id, id)
    if (existing) {
      return NextResponse.json({ success: false, error: { code: 'CONFLICT', message: 'Already participating in this challenge' } }, { status: 409 })
    }

    const body = await request.json()
    const participation = await createChallengeParticipation({
      status: 'JOINED',
      user: { connect: { id: session.user.id } },
      challenge: { connect: { id } },
      proofUrl: body.proofUrl ?? null,
    } as any)

    return NextResponse.json({ success: true, data: participation }, { status: 201 })
  } catch (error) {
    console.error('Join challenge error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to join challenge' } }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin or Manager access required' } }, { status: 403 })
    }

    const { id } = await params
    const url = new URL(request.url)
    const participationId = url.searchParams.get('participationId')
    if (!participationId) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'participationId query param required' } }, { status: 400 })
    }

    const body = await request.json()
    const status = body.status as string

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Status must be APPROVED or REJECTED' } }, { status: 400 })
    }

    const challenge = await findChallengeById(id)
    if (!challenge) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Challenge not found' } }, { status: 404 })
    }

    const xpAwarded = status === 'APPROVED' ? challenge.xpReward : 0

    const participation = await updateChallengeParticipation(participationId, {
      status,
      xpAwarded,
      reviewNote: body.reviewNote ?? null,
    } as any)

    if (status === 'APPROVED') {
      const { prisma } = await import('@/infrastructure/db/prisma')
      await prisma.user.update({
        where: { id: participation.userId },
        data: { totalXP: { increment: xpAwarded }, totalPoints: { increment: xpAwarded } },
      })

      await createNotification({
        userId: participation.userId,
        type: 'CHALLENGE_APPROVED',
        title: 'Challenge Completed!',
        message: `Your submission for "${challenge.title}" was approved! You earned ${xpAwarded} XP.`,
        metadata: { challengeId: id, participationId },
      })
    }

    return NextResponse.json({ success: true, data: participation })
  } catch (error) {
    console.error('Review challenge participation error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to review participation' } }, { status: 500 })
  }
}
