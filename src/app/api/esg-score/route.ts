import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/infrastructure/db/prisma'
import {
  calculateESGScore,
  calculateEnvironmentalScore,
  calculateSocialScore,
  calculateGovernanceScore,
  type ModuleScores,
} from '@/domain/esg/calculator'
import type { ApiResponse, ESGScoreData } from '@/types/api.types'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Sign in required' },
      }, { status: 401 })
    }

    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    const [totalEmissions, departments, goalStats, participationStats, ackStats, complianceStats] = await Promise.all([
      prisma.carbonTransaction.aggregate({
        where: { date: { gte: sixMonthsAgo } },
        _sum: { totalEmissions: true },
      }),
      prisma.department.findMany({
        where: { status: 'ACTIVE' },
        include: {
          environmentalGoals: { where: { status: { not: 'ACHIEVED' } }, orderBy: { deadline: 'asc' }, take: 1 },
          _count: { select: { members: true } },
        },
      }),
      prisma.environmentalGoal.aggregate({ _sum: { targetKg: true } }),
      Promise.all([
        prisma.employeeParticipation.count({ where: { status: 'APPROVED' } }),
        prisma.employeeParticipation.count(),
      ]),
      (async () => {
        const [activePolicies, employees] = await Promise.all([
          prisma.eSGPolicy.count({ where: { status: 'ACTIVE' } }),
          prisma.user.count({ where: { isActive: true, role: 'EMPLOYEE' } }),
        ])
        const acknowledgements = await prisma.policyAcknowledgement.count()
        return {
          totalActivePolicies: activePolicies,
          totalEmployees: employees,
          acknowledged: acknowledgements,
          expected: activePolicies * employees,
        }
      })(),
      (async () => {
        const [criticalOpen, overdue] = await Promise.all([
          prisma.complianceIssue.count({ where: { severity: 'CRITICAL', status: { notIn: ['RESOLVED'] } } }),
          prisma.complianceIssue.count({ where: { status: 'OVERDUE' } }),
        ])
        return { criticalOpen, overdue }
      })(),
    ])

    const totalEmissionsKg = totalEmissions._sum.totalEmissions ?? 0
    const totalGoalKg = goalStats._sum.targetKg ?? 0
    const [approvedParticipations, totalParticipations] = participationStats

    const envScore = calculateEnvironmentalScore(totalEmissionsKg, totalGoalKg)
    const socScore = calculateSocialScore(
      approvedParticipations,
      totalParticipations,
      ackStats.expected > 0 ? ackStats.acknowledged / ackStats.expected : 0
    )
    const govScore = calculateGovernanceScore(
      ackStats.acknowledged,
      ackStats.totalActivePolicies,
      complianceStats.criticalOpen,
      complianceStats.overdue
    )

    const overall = calculateESGScore({
      environmental: envScore,
      social: socScore,
      governance: govScore,
    })

    const deptScores = await Promise.all(
      departments.map(async (dept) => {
        const deptEmissions = await prisma.carbonTransaction.aggregate({
          where: { departmentId: dept.id, date: { gte: sixMonthsAgo } },
          _sum: { totalEmissions: true },
        })
        const deptGoal = dept.environmentalGoals[0]
        const dEnv = calculateEnvironmentalScore(deptEmissions._sum.totalEmissions ?? 0, deptGoal?.targetKg ?? null)

        const deptApproved = await prisma.employeeParticipation.count({
          where: { activity: { createdById: session.user!.id }, status: 'APPROVED' },
        })
        const deptTotal = await prisma.employeeParticipation.count({
          where: { activity: { createdById: session.user!.id } },
        })
        const dSoc = calculateSocialScore(deptApproved, deptTotal, 0.5)

        const dGov = calculateGovernanceScore(0, 1, 0, 0)

        const dOverall = calculateESGScore({ environmental: dEnv, social: dSoc, governance: dGov })

        return {
          id: dept.id,
          name: dept.name,
          score: dOverall,
          environmental: dEnv,
          social: dSoc,
          governance: dGov,
        }
      })
    )

    const response: ApiResponse<ESGScoreData> = {
      success: true,
      data: {
        overall,
        environmental: envScore,
        social: socScore,
        governance: govScore,
        departments: deptScores,
      },
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error('ESG Score error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate ESG score' },
    }, { status: 500 })
  }
}
