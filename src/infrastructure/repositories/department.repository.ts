import { prisma } from '@/infrastructure/db/prisma'

export async function listDepartments() {
  return prisma.department.findMany({
    where: { status: 'ACTIVE' },
    include: {
      _count: { select: { members: true } },
      head: { select: { id: true, name: true, email: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export async function findDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true } },
      head: { select: { id: true, name: true } },
    },
  })
}

export async function getDepartmentCount() {
  return prisma.department.count({ where: { status: 'ACTIVE' } })
}
