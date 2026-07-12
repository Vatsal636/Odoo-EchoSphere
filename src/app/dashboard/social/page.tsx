'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Users, Plus, ArrowUpRight, Heart, Handshake, UserCheck, ShieldAlert, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { motion } from 'framer-motion'
import type { ApiResponse } from '@/types/api.types'

export default function SocialPage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const isAdmin = role === 'ADMIN'
  const isManager = role === 'MANAGER'

  const { data: participantCount } = useQuery({
    queryKey: ['participation-count'],
    queryFn: async () => {
      const res = await fetch('/api/csr-activities')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return (json.data as any[])?.reduce((sum: number, a: any) => sum + (a._count?.participations ?? 0), 0) ?? 0
    },
  })

  const { data: activities, isLoading } = useQuery({
    queryKey: ['csr-activities'],
    queryFn: async () => {
      const res = await fetch('/api/csr-activities')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const activeActivities = activities?.filter((a: any) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED') ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Social</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium ${
              isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' :
              isManager ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
              'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300'
            }`}>
              {isAdmin ? <ShieldAlert className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {role?.toLowerCase() ?? 'loading'}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">CSR activities and employee participation</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/social/participation">
            <Button variant="outline" className="gap-2"><UserCheck className="h-4 w-4" />Participation</Button>
          </Link>
          {isAdmin && (
            <Link href="/dashboard/social/csr-activities">
              <Button className="gap-2"><Plus className="h-4 w-4" />New Activity</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Activities', value: activities?.length ?? 0, icon: Heart, color: 'from-blue-500 to-blue-600' },
          { label: 'Active', value: activeActivities.length, icon: Handshake, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Completed', value: activities?.filter((a: any) => a.status === 'COMPLETED').length ?? 0, icon: Users, color: 'from-indigo-500 to-indigo-600' },
          { label: 'Participants', value: participantCount ?? 0, icon: UserCheck, color: 'from-cyan-500 to-cyan-600' },
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
            <Heart className="h-4 w-4 text-blue-500" />
            Active CSR Activities
          </CardTitle>
          <Link href="/dashboard/social/csr-activities">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ArrowUpRight className="h-3 w-3" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton rows={3} /> : !activities?.length ? (
            <EmptyState title="No activities" description="Create CSR activities to engage employees" />
          ) : (
            <div className="space-y-2">
              {activeActivities.map((activity: any) => (
                <Link key={activity.id} href={`/dashboard/social/csr-activities/${activity.id}`}>
                  <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(activity.startDate).toLocaleDateString()} · {activity._count?.participations ?? 0} participant{(activity._count?.participations ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <StatusBadge status={activity.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
