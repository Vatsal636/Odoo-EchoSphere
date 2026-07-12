import { prisma } from '@/infrastructure/db/prisma'
import type { User, Prisma } from '@prisma/client'

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { department: true },
  })
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({ data })
}

export async function updateUser(id: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({ where: { id }, data })
}

export async function listUsers(options?: { departmentId?: string; role?: string }) {
  const where: Prisma.UserWhereInput = { isActive: true }
  if (options?.departmentId) where.departmentId = options.departmentId
  if (options?.role) where.role = options.role as Prisma.EnumRoleFilter['equals']
  return prisma.user.findMany({
    where,
    include: { department: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  })
}

export async function getUserStats() {
  const [totalEmployees, activeEmployees] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true, role: 'EMPLOYEE' } }),
  ])
  return { totalEmployees, activeEmployees }
}
