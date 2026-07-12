'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Leaf, Plus, ArrowUpRight, Target, Flame, TrendingDown, ShieldAlert, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { motion } from 'framer-motion'
import type { ApiResponse } from '@/types/api.types'

export default function EnvironmentalPage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const isAdmin = role === 'ADMIN'
  const isManager = role === 'MANAGER'

  const { data: goals } = useQuery({
    queryKey: ['environmental-goals'],
    queryFn: async () => {
      const res = await fetch('/api/environmental-goals')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const { data: txCount } = useQuery({
    queryKey: ['carbon-tx-count'],
    queryFn: async () => {
      const res = await fetch('/api/carbon-transactions')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return (json.data as any[])?.length ?? 0
    },
  })

  const activeGoals = goals?.filter((g: any) => g.status !== 'COMPLETED' && g.status !== 'CANCELLED') ?? []
  const completedCount = goals?.filter((g: any) => g.status === 'ACHIEVED').length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Environmental</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium ${
              isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' :
              isManager ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
              'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300'
            }`}>
              {isAdmin ? <ShieldAlert className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {role?.toLowerCase() ?? 'loading'}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Track carbon emissions and environmental goals</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/environmental/emissions">
            <Button variant="outline" className="gap-2"><Flame className="h-4 w-4" />Emissions</Button>
          </Link>
          {isAdmin && (
            <Link href="/dashboard/environmental/goals">
              <Button className="gap-2"><Plus className="h-4 w-4" />New Goal</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Goals', value: goals?.length ?? 0, icon: Target, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Active Goals', value: activeGoals.length, icon: TrendingDown, color: 'from-green-500 to-green-600' },
          { label: 'Achieved', value: completedCount, icon: Leaf, color: 'from-emerald-600 to-emerald-700' },
          { label: 'Emissions Tracked', value: txCount ?? 0, icon: Flame, color: 'from-orange-500 to-orange-600' },
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

      <Card className="shadow-sm border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-500" />
            Active Environmental Goals
          </CardTitle>
          <Link href="/dashboard/environmental/goals">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ArrowUpRight className="h-3 w-3" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!goals ? <TableSkeleton rows={3} /> : !goals.length ? (
            <EmptyState title="No goals" description={isAdmin ? 'Create environmental goals to track progress' : 'No goals available'} />
          ) : (
            <div className="space-y-2">
              {activeGoals.map((goal: any) => (
                <div key={goal.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{goal.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Target: {goal.targetKg} {goal.unit} · {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(goal.currentKg / goal.targetKg * 100, 100)}%` }} />
                      </div>
                      <span className="text-muted-foreground">{Math.round(goal.currentKg / goal.targetKg * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
