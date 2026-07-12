'use client'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { formatDate } from '@/lib/utils'
import type { ApiResponse } from '@/types/api.types'

export default function ParticipationPage() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['csr-activities'],
    queryFn: async () => {
      const res = await fetch('/api/csr-activities')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Participation</h1>
        <p className="text-muted-foreground">Track employee participation in CSR activities</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All Activities</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton rows={4} /> : !activities?.length ? (
            <EmptyState title="No activities" description="No CSR activities available" />
          ) : (
            <div className="space-y-3">
              {activities.map((activity: any) => (
                <div key={activity.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(activity.startDate)} - {formatDate(activity.endDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{activity._count?.participations ?? 0} participants</span>
                      <StatusBadge status={activity.status} />
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
