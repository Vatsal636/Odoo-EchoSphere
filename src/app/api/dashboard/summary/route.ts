import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/infrastructure/db/prisma'
import type { ApiResponse, DashboardSummary } from '@/types/api.types'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const isAdmin = session.user.role === 'ADMIN'

    const [totalUsers, activeDepts, pendingParticipations, overdueIssues, totalBadges] = await Promise.all([
      prisma.user.count(),
      prisma.department.count({ where: { status: 'ACTIVE' } }),
      prisma.employeeParticipation.count({ where: { status: 'PENDING' } }),
      prisma.complianceIssue.count({ where: { status: 'OVERDUE' } }),
      prisma.userBadge.count(),
    ])

    const data: DashboardSummary = {
      totalEmployees: totalUsers,
      activeDepartments: activeDepts,
      pendingParticipations,
      overdueIssues,
      totalBadgesAwarded: totalBadges,
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Dashboard summary error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch dashboard summary' } }, { status: 500 })
  }
}
