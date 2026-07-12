'use client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { formatDate } from '@/lib/utils'
import { Shield, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ApiResponse } from '@/types/api.types'

export default function CompliancePage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const { data: audits, isLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      const res = await fetch('/api/audits')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data ?? []
    },
  })

  const issues = audits?.flatMap((a: any) => a.complianceIssues ?? [a.issues ?? []].flat()) ?? []
  const openCount = issues.filter((i: any) => i.status === 'OPEN').length
  const inProgressCount = issues.filter((i: any) => i.status === 'IN_PROGRESS').length
  const resolvedCount = issues.filter((i: any) => i.status === 'RESOLVED').length
  const overdueCount = issues.filter((i: any) => i.status === 'OVERDUE').length
  const criticalCount = issues.filter((i: any) => i.severity === 'CRITICAL').length

  const stats = [
    { label: 'Open', value: openCount, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'In Progress', value: inProgressCount, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Resolved', value: resolvedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Overdue', value: overdueCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
    { label: 'Critical', value: criticalCount, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compliance</h1>
        <p className="text-muted-foreground text-sm">Track compliance issues across audits</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className={`rounded-lg ${stat.bg} p-2 inline-flex`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-500" />
            Compliance Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton rows={5} /> : !issues.length ? (
            <EmptyState title="No compliance data" description="Compliance issues will appear here once audits are created" />
          ) : (
            <div className="space-y-2">
              {issues.map((issue: any) => (
                <div key={issue.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-3 hover:bg-accent/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{issue.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Due: {issue.dueDate ? formatDate(issue.dueDate) : 'N/A'}</span>
                      {issue.owner?.name && <span>· {issue.owner.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={issue.severity} />
                    <StatusBadge status={issue.status} />
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
