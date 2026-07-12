import { prisma } from '@/infrastructure/db/prisma'
import type { Prisma } from '@prisma/client'

export async function listPolicies(options?: { status?: string }) {
  const where: Prisma.ESGPolicyWhereInput = {}
  if (options?.status) where.status = options.status as Prisma.EnumPolicyStatusFilter['equals']
  return prisma.eSGPolicy.findMany({
    where,
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { acknowledgements: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findPolicyById(id: string) {
  return prisma.eSGPolicy.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      acknowledgements: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })
}

export async function createPolicy(data: Prisma.ESGPolicyCreateInput) {
  return prisma.eSGPolicy.create({
    data,
    include: { createdBy: { select: { id: true, name: true } } },
  })
}

export async function acknowledgePolicy(policyId: string, userId: string) {
  return prisma.policyAcknowledgement.upsert({
    where: { policyId_userId: { policyId, userId } },
    create: { policyId, userId },
    update: {},
  })
}

export async function getAcknowledgementStats(policyId?: string) {
  const policyWhere: Prisma.ESGPolicyWhereInput = { status: 'ACTIVE' }
  if (policyId) policyWhere.id = policyId

  const activePolicies = await prisma.eSGPolicy.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
  })
  const totalActivePolicies = activePolicies.length

  const totalEmployees = await prisma.user.count({
    where: { isActive: true, role: 'EMPLOYEE' },
  })

  const acknowledged = await prisma.policyAcknowledgement.count()
  const expected = totalActivePolicies * totalEmployees

  return {
    totalActivePolicies,
    totalEmployees,
    acknowledged,
    expected,
    rate: expected > 0 ? acknowledged / expected : 0,
  }
}

export async function listAudits() {
  return prisma.audit.findMany({
    include: {
      auditor: { select: { id: true, name: true } },
      _count: { select: { complianceIssues: true } },
    },
    orderBy: { startDate: 'desc' },
  })
}

export async function findAuditById(id: string) {
  return prisma.audit.findUnique({
    where: { id },
    include: {
      auditor: { select: { id: true, name: true } },
      complianceIssues: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function createAudit(data: Prisma.AuditCreateInput) {
  return prisma.audit.create({
    data,
    include: { auditor: { select: { id: true, name: true } } },
  })
}

export async function createComplianceIssue(data: Prisma.ComplianceIssueCreateInput) {
  return prisma.complianceIssue.create({ data })
}

export async function updateComplianceIssue(id: string, data: Prisma.ComplianceIssueUpdateInput) {
  return prisma.complianceIssue.update({ where: { id }, data })
}

export async function listComplianceIssues(options?: { status?: string }) {
  const where: Prisma.ComplianceIssueWhereInput = {}
  if (options?.status) where.status = options.status as Prisma.EnumIssueStatusFilter['equals']
  return prisma.complianceIssue.findMany({
    where,
    include: {
      audit: { select: { id: true, title: true } },
      owner: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
  })
}

export async function getComplianceStats() {
  const [open, inProgress, resolved, overdue, critical] = await Promise.all([
    prisma.complianceIssue.count({ where: { status: 'OPEN' } }),
    prisma.complianceIssue.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.complianceIssue.count({ where: { status: 'RESOLVED' } }),
    prisma.complianceIssue.count({ where: { status: 'OVERDUE' } }),
    prisma.complianceIssue.count({ where: { severity: 'CRITICAL', status: { not: 'RESOLVED' } } }),
  ])
  return { open, inProgress, resolved, overdue, critical }
}
