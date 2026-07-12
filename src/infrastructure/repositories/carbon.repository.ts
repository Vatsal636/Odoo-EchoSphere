import { prisma } from '@/infrastructure/db/prisma'
import type { Prisma } from '@prisma/client'

export async function createCarbonTransaction(data: Prisma.CarbonTransactionCreateInput) {
  return prisma.carbonTransaction.create({
    data,
    include: { emissionFactor: true, department: true, user: { select: { id: true, name: true } } },
  })
}

export async function getCarbonTransactions(options?: {
  departmentId?: string
  from?: Date
  to?: Date
  page?: number
  pageSize?: number
}) {
  const where: Prisma.CarbonTransactionWhereInput = {}
  if (options?.departmentId) where.departmentId = options.departmentId
  if (options?.from || options?.to) {
    where.date = {}
    if (options?.from) where.date.gte = options.from
    if (options?.to) where.date.lte = options.to
  }

  const page = options?.page ?? 1
  const pageSize = options?.pageSize ?? 50
  const skip = (page - 1) * pageSize

  const [data, total] = await Promise.all([
    prisma.carbonTransaction.findMany({
      where,
      include: { emissionFactor: true, department: true, user: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.carbonTransaction.count({ where }),
  ])

  return { data, total, page, pageSize }
}

export async function getTotalEmissionsByDepartment(
  departmentId: string,
  from: Date,
  to: Date
) {
  const result = await prisma.carbonTransaction.aggregate({
    where: { departmentId, date: { gte: from, lte: to } },
    _sum: { totalEmissions: true },
  })
  return result._sum.totalEmissions ?? 0
}

export async function getTotalEmissionsAllDepartments(from: Date, to: Date) {
  const result = await prisma.carbonTransaction.aggregate({
    where: { date: { gte: from, lte: to } },
    _sum: { totalEmissions: true },
  })
  return result._sum.totalEmissions ?? 0
}

export async function listEmissionFactors() {
  return prisma.emissionFactor.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
}

export async function listEnvironmentalGoals(options?: { departmentId?: string }) {
  const where: Prisma.EnvironmentalGoalWhereInput = {}
  if (options?.departmentId) where.departmentId = options.departmentId
  return prisma.environmentalGoal.findMany({
    where,
    include: { department: { select: { id: true, name: true } } },
    orderBy: { deadline: 'asc' },
  })
}

export async function createEnvironmentalGoal(data: Prisma.EnvironmentalGoalCreateInput) {
  return prisma.environmentalGoal.create({
    data,
    include: { department: { select: { id: true, name: true } } },
  })
}
