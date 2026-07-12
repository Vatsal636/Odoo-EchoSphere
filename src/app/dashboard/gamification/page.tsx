'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Gamepad2, Award, Gift, Trophy, Star, ArrowUpRight, Zap, Users, ShieldAlert, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { motion } from 'framer-motion'
import type { ApiResponse } from '@/types/api.types'

export default function GamificationPage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const isAdmin = role === 'ADMIN'
  const isManager = role === 'MANAGER'

  const { data: challengeStats } = useQuery({
    queryKey: ['challenge-stats'],
    queryFn: async () => {
      const res = await fetch('/api/challenges')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      const data = json.data ?? []
      const participants = data.reduce((sum: number, c: any) => sum + (c._count?.participations ?? 0), 0)
      const totalXP = data.reduce((sum: number, c: any) => sum + (c._count?.xpAwarded ?? c.xpReward ?? 0), 0)
      return { participants, totalXP }
    },
  })

  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const res = await fetch('/api/challenges')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const { data: badges } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const res = await fetch('/api/badges')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const activeChallenges = challenges?.filter((c: any) => c.status === 'ACTIVE') ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Gamification</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium ${
              isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' :
              isManager ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
              'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300'
            }`}>
              {isAdmin ? <ShieldAlert className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {role?.toLowerCase() ?? 'loading'}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Challenges, badges, rewards, and leaderboards</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/gamification/challenges"><Button variant="outline" className="gap-2"><Gamepad2 className="h-4 w-4" />Challenges</Button></Link>
          <Link href="/dashboard/gamification/badges"><Button variant="outline" className="gap-2"><Award className="h-4 w-4" />Badges</Button></Link>
          <Link href="/dashboard/gamification/rewards"><Button variant="outline" className="gap-2"><Gift className="h-4 w-4" />Rewards</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Challenges', value: activeChallenges.length, icon: Trophy, color: 'from-amber-500 to-amber-600' },
          { label: 'Total Badges', value: badges?.length ?? 0, icon: Award, color: 'from-purple-500 to-purple-600' },
          { label: 'Participants', value: challengeStats?.participants ?? 0, icon: Users, color: 'from-blue-500 to-blue-600' },
          { label: 'XP Earned', value: challengeStats?.totalXP ?? 0, icon: Zap, color: 'from-yellow-500 to-yellow-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className={`rounded-lg bg-gradient-to-br ${stat.color} p-2 shadow-sm inline-flex`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-amber-500" />
              Active Challenges
            </CardTitle>
            <Link href="/dashboard/gamification/challenges">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ArrowUpRight className="h-3 w-3" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {challengesLoading ? <TableSkeleton rows={3} /> : !challenges?.length ? (
              <EmptyState title="No challenges" description="Create challenges to engage employees" />
            ) : (
              <div className="space-y-2">
                {activeChallenges.slice(0, 5).map((challenge: any) => (
                  <Link key={challenge.id} href={`/dashboard/gamification/challenges/${challenge.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{challenge.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{challenge.xpReward} XP reward</p>
                      </div>
                      <StatusBadge status={challenge.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              Available Badges
            </CardTitle>
            <Link href="/dashboard/gamification/badges">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ArrowUpRight className="h-3 w-3" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!badges ? <TableSkeleton rows={3} /> : !badges.length ? (
              <EmptyState title="No badges" description="Badges will appear here once created" />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {badges.slice(0, 6).map((badge: any) => (
                  <div key={badge.id} className="flex flex-col items-center gap-1 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight">{badge.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
