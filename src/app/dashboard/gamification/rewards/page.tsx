'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Gift, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import type { ApiResponse } from '@/types/api.types'
import { useToast } from '@/components/ui/toast'

export default function RewardsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pointsRequired, setPointsRequired] = useState('')
  const [stock, setStock] = useState('')

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const res = await fetch('/api/rewards')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/rewards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] })
      setShowForm(false); setName('')
      toast('Reward added successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to add reward', 'error')
    },
  })

  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const res = await fetch(`/api/rewards/${rewardId}/redeem`, { method: 'POST' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] })
      toast('Reward redeemed successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to redeem reward', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name, description, pointsRequired: parseInt(pointsRequired), stock: parseInt(stock) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rewards Catalog</h1>
          <p className="text-muted-foreground">Redeem points for rewards</p>
        </div>
        {isAdmin && <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />Add Reward</Button>}
      </div>

      {isAdmin && showForm && (
        <Card>
          <CardHeader><CardTitle>Add Reward</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Points Required</Label>
                <Input type="number" value={pointsRequired} onChange={(e) => setPointsRequired(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <TableSkeleton key={i} />)
        ) : !rewards?.length ? (
          <div className="col-span-full">
            <EmptyState title="No rewards" description="Add rewards to the catalog" />
          </div>
        ) : (
          rewards.map((reward: any) => (
            <Card key={reward.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <Gift className="h-5 w-5 text-purple-600" />
                  </div>
                  <StatusBadge status={reward.status} />
                </div>
                <h3 className="font-semibold">{reward.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{reward.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-lg font-bold text-purple-600">{reward.pointsRequired}</p>
                    <p className="text-xs text-muted-foreground">points · Stock: {reward.stock}</p>
                  </div>
                  <Button size="sm" disabled={reward.stock < 1 || redeemMutation.isPending} onClick={() => redeemMutation.mutate(reward.id)}>
                    {redeemMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Redeem'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
