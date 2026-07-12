'use client'
import { useQuery } from '@tanstack/react-query'
import { Users, Building2, Clock, AlertTriangle, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import type { ApiResponse, DashboardSummary } from '@/types/api.types'

export function SummaryCards() {
  const { data, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/summary')
      const json: ApiResponse<DashboardSummary> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const cards = [
    { label: 'Total Employees', value: data?.totalEmployees ?? 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Departments', value: data?.activeDepartments ?? 0, icon: Building2, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending Reviews', value: data?.pendingParticipations ?? 0, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Overdue Issues', value: data?.overdueIssues ?? 0, icon: AlertTriangle, color: 'from-red-500 to-red-600' },
    { label: 'Badges Awarded', value: data?.totalBadgesAwarded ?? 0, icon: Award, color: 'from-purple-500 to-purple-600' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label} className="overflow-hidden border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-xl bg-gradient-to-br ${card.color} p-2.5 shadow-sm`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
              {isLoading ? (
                <LoadingSkeleton className="h-6 w-12 mt-0.5" />
              ) : (
                <p className="text-xl font-bold tracking-tight">{card.value}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
