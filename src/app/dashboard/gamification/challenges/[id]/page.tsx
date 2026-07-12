'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Check, X, Gamepad2, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import type { ApiResponse } from '@/types/api.types'
import { useToast } from '@/components/ui/toast'

export default function ChallengeDetailPage() {
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER'
  const userId = session?.user?.id

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', id],
    queryFn: async () => {
      const res = await fetch(`/api/challenges/${id}`)
      const json: ApiResponse<any> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/challenges/${id}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge', id] })
      toast('Joined challenge successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to join challenge', 'error')
    },
  })

  const reviewMutation = useMutation({
    mutationFn: async ({ participationId, status }: { participationId: string; status: string }) => {
      const res = await fetch(`/api/challenges/${id}/participate?participationId=${participationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge', id] })
      queryClient.invalidateQueries({ queryKey: ['esg-score'] })
      toast('Participation reviewed successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to review participation', 'error')
    },
  })

  if (isLoading) return <LoadingSkeleton className="h-64 w-full" />
  if (!challenge) return <div className="text-destructive">Challenge not found</div>

  const userParticipation = challenge.participations?.find((p: any) => p.userId === userId)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">{challenge.title}</h1>
          <StatusBadge status={challenge.status} />
          {userParticipation && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">You joined</span>}
        </div>
        <p className="text-muted-foreground mt-1">{challenge.description}</p>
        {!userParticipation && challenge.status === 'ACTIVE' && !isAdmin && (
          <Button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending} className="mt-4 gap-2">
            {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            {joinMutation.isPending ? 'Joining...' : 'Join Challenge'}
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Gamepad2 className="h-4 w-4 text-amber-500" />Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'XP Reward', value: `${challenge.xpReward} XP`, color: 'text-orange-600 font-bold' },
              { label: 'Difficulty', value: challenge.difficulty },
              { label: 'Deadline', value: formatDate(challenge.deadline) },
              { label: 'Participants', value: challenge.participations?.length ?? 0 },
              { label: 'Created by', value: challenge.createdBy?.name },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={item.color ?? ''}>{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-500" />
              Participations ({challenge.participations?.length ?? 0})
              {isAdmin && <span className="text-[10px] text-muted-foreground font-normal ml-auto">Admin review</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!challenge.participations?.length ? (
              <EmptyState title="No participants" description="No employees have joined this challenge yet" />
            ) : (
              <div className="space-y-2">
                {challenge.participations.map((p: any) => (
                  <div key={p.id} className="rounded-lg border p-3 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{p.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{p.user?.department?.name} · Progress: {p.progress}%</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    {p.status === 'SUBMITTED' && isAdmin && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="text-green-600 gap-1" onClick={() => reviewMutation.mutate({ participationId: p.id, status: 'APPROVED' })}>
                          {reviewMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
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
