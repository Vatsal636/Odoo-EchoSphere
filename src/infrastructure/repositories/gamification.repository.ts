import { prisma } from '@/infrastructure/db/prisma'
import type { Prisma } from '@prisma/client'

export async function listChallenges(options?: { status?: string }) {
  const where: Prisma.ChallengeWhereInput = {}
  if (options?.status) where.status = options.status as Prisma.EnumChallengeStatusFilter['equals']
  return prisma.challenge.findMany({
    where,
    include: {
      category: true,
      createdBy: { select: { id: true, name: true } },
      _count: { select: { participations: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findChallengeById(id: string) {
  return prisma.challenge.findUnique({
    where: { id },
    include: {
      category: true,
      createdBy: { select: { id: true, name: true } },
      participations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function createChallenge(data: Prisma.ChallengeCreateInput) {
  return prisma.challenge.create({
    data,
    include: { category: true, createdBy: { select: { id: true, name: true } } },
  })
}

export async function updateChallenge(id: string, data: Prisma.ChallengeUpdateInput) {
  return prisma.challenge.update({ where: { id }, data })
}

export async function createChallengeParticipation(data: Prisma.ChallengeParticipationCreateInput) {
  return prisma.challengeParticipation.create({ data })
}

export async function findChallengeParticipation(userId: string, challengeId: string) {
  return prisma.challengeParticipation.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  })
}

export async function updateChallengeParticipation(id: string, data: Prisma.ChallengeParticipationUpdateInput) {
  return prisma.challengeParticipation.update({ where: { id }, data })
}

export async function getCompletedChallengeCount(userId: string) {
  return prisma.challengeParticipation.count({
    where: { userId, status: 'APPROVED' },
  })
}

export async function listBadges() {
  return prisma.badge.findMany({ orderBy: { name: 'asc' } })
}

export async function getUserBadgeIds(userId: string): Promise<Set<string>> {
  const badges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  })
  return new Set(badges.map((b) => b.badgeId))
}

export async function awardBadge(userId: string, badgeId: string) {
  return prisma.userBadge.create({ data: { userId, badgeId } })
}

export async function listRewards() {
  return prisma.reward.findMany({
    where: { status: { not: 'DISCONTINUED' } },
    orderBy: { name: 'asc' },
  })
}

export async function findRewardById(id: string) {
  return prisma.reward.findUnique({ where: { id } })
}

export async function redeemReward(userId: string, rewardId: string, pointsDeducted: number) {
  return prisma.$transaction(async (tx) => {
    const reward = await tx.reward.findUnique({ where: { id: rewardId } })
    if (!reward) throw new Error('REWARD_NOT_FOUND')
    if (reward.stock < 1) throw new Error('OUT_OF_STOCK')

    const user = await tx.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('USER_NOT_FOUND')
    if (user.totalPoints < pointsDeducted) throw new Error('INSUFFICIENT_POINTS')

    await tx.reward.update({
      where: { id: rewardId },
      data: { stock: { decrement: 1 } },
    })

    await tx.user.update({
      where: { id: userId },
      data: { totalPoints: { decrement: pointsDeducted } },
    })

    return tx.rewardRedemption.create({
      data: { userId, rewardId, pointsDeducted },
      include: { reward: true, user: { select: { id: true, name: true, totalPoints: true } } },
    })
  })
}

export async function getLeaderboard(options?: { departmentId?: string; limit?: number }) {
  const where: Prisma.UserWhereInput = { isActive: true }
  if (options?.departmentId) where.departmentId = options.departmentId

  return prisma.user.findMany({
    where,
    orderBy: { totalXP: 'desc' },
    take: options?.limit ?? 20,
    select: {
      id: true,
      name: true,
      totalXP: true,
      totalPoints: true,
      department: { select: { id: true, name: true } },
      _count: { select: { userBadges: true, challengeParticipations: { where: { status: 'APPROVED' } } } },
    },
  })
}
