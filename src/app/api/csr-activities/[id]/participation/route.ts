import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CreateParticipationSchema, ReviewParticipationSchema } from '@/lib/validations/social.schema'
import { createParticipation, findParticipationByUserAndActivity, updateParticipation, findCSRActivityById } from '@/infrastructure/repositories/social.repository'
import { createNotification } from '@/infrastructure/notifications/notifier'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    if (session.user.role === 'ADMIN') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admins cannot participate in activities' } }, { status: 403 })
    }

    const { id } = await params
    const existing = await findParticipationByUserAndActivity(session.user.id, id)
    if (existing) {
      return NextResponse.json({ success: false, error: { code: 'CONFLICT', message: 'Already participating in this activity' } }, { status: 409 })
    }

    const body = await request.json()
    const parsed = CreateParticipationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const participation = await createParticipation({
      status: 'PENDING',
      user: { connect: { id: session.user.id } },
      activity: { connect: { id } },
      ...(parsed.data.proofUrl ? { proofUrl: parsed.data.proofUrl } : {}),
    } as any)

    return NextResponse.json({ success: true, data: participation }, { status: 201 })
  } catch (error) {
    console.error('Create participation error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to join activity' } }, { status: 500 })
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
    const parsed = ReviewParticipationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const activity = await findCSRActivityById(id)
    if (!activity) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Activity not found' } }, { status: 404 })
    }

    const pointsEarned = parsed.data.status === 'APPROVED' ? activity.points : 0

    const participation = await updateParticipation(participationId, {
      status: parsed.data.status,
      pointsEarned,
      reviewNote: parsed.data.reviewNote ?? null,
      completionDate: parsed.data.status === 'APPROVED' ? new Date() : null,
    } as any)

    if (parsed.data.status === 'APPROVED') {
      const { prisma } = await import('@/infrastructure/db/prisma')
      await prisma.user.update({
        where: { id: participation.userId },
        data: { totalPoints: { increment: pointsEarned }, totalXP: { increment: pointsEarned } },
      })

      await createNotification({
        userId: participation.userId,
        type: 'PARTICIPATION_APPROVED',
        title: 'Participation Approved',
        message: `Your participation in "${activity.title}" has been approved! You earned ${pointsEarned} points.`,
        metadata: { activityId: id, participationId },
      })
    } else if (parsed.data.status === 'REJECTED') {
      await createNotification({
        userId: participation.userId,
        type: 'PARTICIPATION_REJECTED',
        title: 'Participation Rejected',
        message: `Your participation in "${activity.title}" was rejected. ${parsed.data.reviewNote ? `Reason: ${parsed.data.reviewNote}` : ''}`,
        metadata: { activityId: id, participationId },
      })
    }

    return NextResponse.json({ success: true, data: participation })
  } catch (error) {
    console.error('Review participation error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to review participation' } }, { status: 500 })
  }
}
