import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { redeemReward } from '@/infrastructure/repositories/gamification.repository'
import { createNotification } from '@/infrastructure/notifications/notifier'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const { id } = await params

    const { prisma } = await import('@/infrastructure/db/prisma')
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'User not found' } }, { status: 404 })
    }

    const reward = await prisma.reward.findUnique({ where: { id } })
    if (!reward) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Reward not found' } }, { status: 404 })
    }

    if (reward.stock < 1) {
      return NextResponse.json({ success: false, error: { code: 'UNPROCESSABLE', message: 'Reward is out of stock' } }, { status: 422 })
    }

    if ((user.totalPoints ?? 0) < reward.pointsRequired) {
      return NextResponse.json({ success: false, error: { code: 'UNPROCESSABLE', message: 'Insufficient points' } }, { status: 422 })
    }

    const redemption = await redeemReward(session.user.id, id, reward.pointsRequired)

    await createNotification({
      userId: session.user.id,
      type: 'REWARD_REDEEMED',
      title: 'Reward Redeemed',
      message: `You redeemed "${reward.name}" for ${reward.pointsRequired} points.`,
      metadata: { rewardId: id, redemptionId: redemption.id },
    })

    return NextResponse.json({ success: true, data: redemption }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'OUT_OF_STOCK') {
      return NextResponse.json({ success: false, error: { code: 'UNPROCESSABLE', message: 'Reward is out of stock' } }, { status: 422 })
    }
    if (error.message === 'INSUFFICIENT_POINTS') {
      return NextResponse.json({ success: false, error: { code: 'UNPROCESSABLE', message: 'Insufficient points' } }, { status: 422 })
    }
    console.error('Redeem reward error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to redeem reward' } }, { status: 500 })
  }
}
