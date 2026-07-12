'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Shield, FileText, ClipboardCheck, Plus, ArrowUpRight, Scale, AlertTriangle, CheckCircle, ShieldAlert, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { motion } from 'framer-motion'
import type { ApiResponse } from '@/types/api.types'

export default function GovernancePage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const isAdmin = role === 'ADMIN'
  const isManager = role === 'MANAGER'

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const res = await fetch('/api/policies')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const { data: audits, isLoading: auditsLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      const res = await fetch('/api/audits')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const activePolicies = policies?.filter((p: any) => p.status === 'ACTIVE') ?? []
  const activeAudits = audits?.filter((a: any) => a.status === 'IN_PROGRESS' || a.status === 'PLANNED') ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Governance</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium ${
              isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' :
              isManager ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
              'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300'
            }`}>
              {isAdmin ? <ShieldAlert className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {role?.toLowerCase() ?? 'loading'}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Policies, audits, and compliance management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/governance/policies">
            <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" />Policies</Button>
          </Link>
          <Link href="/dashboard/governance/compliance">
            <Button variant="outline" className="gap-2"><ClipboardCheck className="h-4 w-4" />Compliance</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Policies', value: policies?.length ?? 0, icon: FileText, color: 'from-purple-500 to-purple-600' },
          { label: 'Active', value: activePolicies.length, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Total Audits', value: audits?.length ?? 0, icon: Shield, color: 'from-blue-500 to-blue-600' },
          { label: 'In Progress', value: activeAudits.length, icon: AlertTriangle, color: 'from-amber-500 to-amber-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg bg-gradient-to-br ${stat.color} p-2 shadow-sm`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
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
              <FileText className="h-4 w-4 text-purple-500" />
              Active Policies
            </CardTitle>
            <Link href="/dashboard/governance/policies">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {policiesLoading ? <TableSkeleton rows={3} /> : !policies?.length ? (
              <EmptyState title="No policies" description="No ESG policies created yet" />
            ) : (
              <div className="space-y-2">
                {activePolicies.slice(0, 5).map((policy: any) => (
                  <div key={policy.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{policy.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {policy._count?.acknowledgements ?? 0} acknowledgement{(policy._count?.acknowledgements ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <StatusBadge status={policy.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Recent Audits
            </CardTitle>
            <Link href="/dashboard/governance/audits">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {auditsLoading ? <TableSkeleton rows={3} /> : !audits?.length ? (
              <EmptyState title="No audits" description="No audits scheduled" />
            ) : (
              <div className="space-y-2">
                {audits.slice(0, 5).map((audit: any) => (
                  <Link key={audit.id} href={`/dashboard/governance/audits/${audit.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{audit.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{audit.scope}</p>
                      </div>
                      <StatusBadge status={audit.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
