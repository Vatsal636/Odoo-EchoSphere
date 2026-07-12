'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Loader2, Check, X, Heart, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { formatDate } from '@/lib/utils'
import type { ApiResponse } from '@/types/api.types'
import { useToast } from '@/components/ui/toast'

export default function CSRActivityDetailPage() {
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER'
  const userId = session?.user?.id
  const [reviewNote, setReviewNote] = useState('')

  const { data: activity, isLoading } = useQuery({
    queryKey: ['csr-activity', id],
    queryFn: async () => {
      const res = await fetch(`/api/csr-activities/${id}`)
      const json: ApiResponse<any> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/csr-activities/${id}/participation`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csr-activity', id] })
      toast('Joined activity successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to join activity', 'error')
    },
  })

  const reviewMutation = useMutation({
    mutationFn: async ({ participationId, status }: { participationId: string; status: string }) => {
      const res = await fetch(`/api/csr-activities/${id}/participation?participationId=${participationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNote }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csr-activity', id] })
      queryClient.invalidateQueries({ queryKey: ['esg-score'] })
      setReviewNote('')
      toast('Participation reviewed successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to review participation', 'error')
    },
  })

  if (isLoading) return <LoadingSkeleton className="h-64 w-full" />
  if (!activity) return <div className="text-destructive">Activity not found</div>

  const userParticipation = activity.participations?.find((p: any) => p.userId === userId)
  const canJoin = !userParticipation && activity.status !== 'COMPLETED' && activity.status !== 'CANCELLED' && !isAdmin

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">{activity.title}</h1>
          <StatusBadge status={activity.status} />
          {userParticipation && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">You joined</span>}
        </div>
        <p className="text-muted-foreground mt-1">{activity.description}</p>
        {canJoin && (
          <Button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending} className="mt-4 gap-2">
            {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            {joinMutation.isPending ? 'Joining...' : 'Participate'}
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-blue-500" />Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Points', value: activity.points },
              { label: 'Max Participants', value: activity.maxParticipants ?? 'Unlimited' },
              { label: 'Start Date', value: formatDate(activity.startDate) },
              { label: 'End Date', value: formatDate(activity.endDate) },
              { label: 'Participants', value: activity.participations?.length ?? 0 },
              { label: 'Created by', value: activity.createdBy?.name },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              Participations ({activity.participations?.length ?? 0})
              {isAdmin && <span className="text-[10px] text-muted-foreground font-normal ml-auto">Admin review</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!activity.participations?.length ? (
              <div className="text-sm text-muted-foreground text-center py-8">No participants yet</div>
            ) : (
              <div className="space-y-2">
                {activity.participations.map((p: any) => (
                  <div key={p.id} className="rounded-lg border p-3 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{p.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{p.pointsEarned > 0 ? `${p.pointsEarned} pts earned` : 'Pending'}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    {p.status === 'PENDING' && isAdmin && (
                      <div className="flex gap-2 mt-2">
                        <Input placeholder="Review note (optional)" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} className="text-xs h-8" />
                        <Button size="sm" variant="outline" className="text-green-600 gap-1" onClick={() => reviewMutation.mutate({ participationId: p.id, status: 'APPROVED' })}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 gap-1" onClick={() => reviewMutation.mutate({ participationId: p.id, status: 'REJECTED' })}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    )}
                    {p.reviewNote && <p className="text-xs text-muted-foreground mt-1 italic">Review: {p.reviewNote}</p>}
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
