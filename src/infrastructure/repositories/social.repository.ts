import { prisma } from '@/infrastructure/db/prisma'
import type { Prisma } from '@prisma/client'

export async function listCSRActivities(options?: { status?: string }) {
  const where: Prisma.CSRActivityWhereInput = {}
  if (options?.status) where.status = options.status as Prisma.EnumActivityStatusFilter['equals']
  return prisma.cSRActivity.findMany({
    where,
    include: {
      category: true,
      createdBy: { select: { id: true, name: true } },
      _count: { select: { participations: true } },
    },
    orderBy: { startDate: 'desc' },
  })
}

export async function findCSRActivityById(id: string) {
  return prisma.cSRActivity.findUnique({
    where: { id },
    include: {
      category: true,
      createdBy: { select: { id: true, name: true } },
      participations: {
        include: {
          user: { select: { id: true, name: true, email: true, department: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function createCSRActivity(data: Prisma.CSRActivityCreateInput) {
  return prisma.cSRActivity.create({
    data,
    include: { category: true, createdBy: { select: { id: true, name: true } } },
  })
}

export async function createParticipation(data: Prisma.EmployeeParticipationCreateInput) {
  return prisma.employeeParticipation.create({ data })
}

export async function findParticipationByUserAndActivity(userId: string, activityId: string) {
  return prisma.employeeParticipation.findUnique({
    where: { userId_activityId: { userId, activityId } },
  })
}

export async function updateParticipation(id: string, data: Prisma.EmployeeParticipationUpdateInput) {
  return prisma.employeeParticipation.update({ where: { id }, data })
}

export async function getParticipationStats() {
  const [pending, approved, total] = await Promise.all([
    prisma.employeeParticipation.count({ where: { status: 'PENDING' } }),
    prisma.employeeParticipation.count({ where: { status: 'APPROVED' } }),
    prisma.employeeParticipation.count(),
  ])
  return { pending, approved, total }
}

export async function getEmployeeCSRCount(userId: string) {
  return prisma.employeeParticipation.count({
    where: { userId, status: 'APPROVED' },
  })
}
