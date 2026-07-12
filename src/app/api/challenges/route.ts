import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CreateChallengeSchema, UpdateChallengeStatusSchema } from '@/lib/validations/gamification.schema'
import { listChallenges, createChallenge, updateChallenge, findChallengeById } from '@/infrastructure/repositories/gamification.repository'
import { createNotification } from '@/infrastructure/notifications/notifier'
import { prisma } from '@/infrastructure/db/prisma'
import { assertTransition } from '@/domain/challenges/state-machine'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? undefined

    const challenges = await listChallenges({ status })
    return NextResponse.json({ success: true, data: challenges })
  } catch (error) {
    console.error('Challenges error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch challenges' } }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin or Manager access required' } }, { status: 403 })
    }

    const body = await request.json()
    const parsed = CreateChallengeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const { categoryId, ...rest } = parsed.data
    const challenge = await createChallenge({
      ...rest,
      status: 'DRAFT',
      category: { connect: { id: categoryId } },
      createdBy: { connect: { id: session.user.id } },
    })

    const users = await prisma.user.findMany({ where: { isActive: true } })
    await Promise.all(users.map(u => 
      createNotification({
        userId: u.id,
        type: 'CHALLENGE_CREATED',
        title: 'New Gamification Challenge',
        message: `A new challenge "${challenge.title}" is now available.`,
        metadata: { challengeId: challenge.id },
      })
    ))

    return NextResponse.json({ success: true, data: challenge }, { status: 201 })
  } catch (error) {
    console.error('Create challenge error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create challenge' } }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin or Manager access required' } }, { status: 403 })
    }

    const body = await request.json()
    const parsed = UpdateChallengeStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const url = new URL(request.url)
    const challengeId = url.searchParams.get('id')
    if (!challengeId) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'id query param required' } }, { status: 400 })
    }

    const challenge = await findChallengeById(challengeId)
    if (!challenge) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Challenge not found' } }, { status: 404 })
    }

    try {
      assertTransition(challenge.status as any, parsed.data.status as any)
    } catch (e: any) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNPROCESSABLE', message: e.message },
      }, { status: 422 })
    }

    const updated = await updateChallenge(challengeId, { status: parsed.data.status } as any)

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update challenge error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update challenge' } }, { status: 500 })
  }
}
