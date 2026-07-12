import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CreateRewardSchema } from '@/lib/validations/gamification.schema'
import { listRewards } from '@/infrastructure/repositories/gamification.repository'
import { prisma } from '@/infrastructure/db/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const rewards = await listRewards()
    return NextResponse.json({ success: true, data: rewards })
  } catch (error) {
    console.error('Rewards error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch rewards' } }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } }, { status: 403 })
    }

    const body = await request.json()
    const parsed = CreateRewardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const reward = await prisma.reward.create({
      data: { ...parsed.data, status: 'ACTIVE' },
    })
    return NextResponse.json({ success: true, data: reward }, { status: 201 })
  } catch (error) {
    console.error('Create reward error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create reward' } }, { status: 500 })
  }
}
