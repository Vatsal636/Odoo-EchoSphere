import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getLeaderboard } from '@/infrastructure/repositories/gamification.repository'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const url = new URL(request.url)
    const departmentId = url.searchParams.get('departmentId') ?? undefined
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 20

    const leaderboard = await getLeaderboard({ departmentId, limit })

    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      id: entry.id,
      name: entry.name,
      totalXP: entry.totalXP,
      totalPoints: entry.totalPoints,
      department: entry.department,
      badgesCount: entry._count.userBadges,
      challengesCompleted: entry._count.challengeParticipations,
    }))

    return NextResponse.json({ success: true, data: ranked })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch leaderboard' } }, { status: 500 })
  }
}
