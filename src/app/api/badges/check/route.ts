import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/infrastructure/db/prisma'
import { evaluateBadges } from '@/domain/badges/engine'
import { listBadges, getUserBadgeIds, awardBadge } from '@/infrastructure/repositories/gamification.repository'
import { getEmployeeCSRCount } from '@/infrastructure/repositories/social.repository'
import { getCompletedChallengeCount } from '@/infrastructure/repositories/gamification.repository'
import { createNotification } from '@/infrastructure/notifications/notifier'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const body = await request.json()
    const userId = (body.userId as string) ?? session.user.id

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'User not found' } }, { status: 404 })
    }

    const [allBadges, alreadyEarned, completedChallenges, approvedCSRActivities] = await Promise.all([
      listBadges(),
      getUserBadgeIds(userId),
      getCompletedChallengeCount(userId),
      getEmployeeCSRCount(userId),
    ])

    const progress = {
      totalXP: user.totalXP,
      completedChallenges,
      approvedCSRActivities,
    }

    const badgeCandidates = allBadges.map((b) => ({
      id: b.id,
      name: b.name,
      unlockRule: { type: b.unlockType as any, threshold: b.unlockThreshold },
    }))

    const newlyEarned = evaluateBadges(badgeCandidates, alreadyEarned, progress)

    const awarded: Array<{ id: string; name: string; iconEmoji: string }> = []

    for (const badgeId of newlyEarned) {
      await awardBadge(userId, badgeId)
      const badge = allBadges.find((b) => b.id === badgeId)
      if (badge) {
        awarded.push({ id: badge.id, name: badge.name, iconEmoji: badge.iconEmoji })
        await createNotification({
          userId,
          type: 'BADGE_UNLOCKED',
          title: 'New Badge Unlocked!',
          message: `Congratulations! You earned the "${badge.name}" badge.`,
          metadata: { badgeId: badge.id },
        })
      }
    }

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        newlyEarned: awarded,
        totalBadges: userBadges.length,
        userBadges,
      },
    })
  } catch (error) {
    console.error('Badge check error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to check badges' } }, { status: 500 })
  }
}
