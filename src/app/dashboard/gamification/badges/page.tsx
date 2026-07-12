'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Award, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import type { ApiResponse } from '@/types/api.types'
import { useToast } from '@/components/ui/toast'

export default function BadgesPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [iconEmoji, setIconEmoji] = useState('🏅')
  const [unlockType, setUnlockType] = useState('MIN_XP')
  const [unlockThreshold, setUnlockThreshold] = useState('')

  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const res = await fetch('/api/badges')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/badges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] })
      setShowForm(false); setName('')
      toast('Badge created successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to create badge', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name, description, iconEmoji, unlockType, unlockThreshold: parseInt(unlockThreshold) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Badges</h1>
          <p className="text-muted-foreground">Create and manage achievement badges</p>
        </div>
        {isAdmin && <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />New Badge</Button>}
      </div>

      {isAdmin && showForm && (
        <Card>
          <CardHeader><CardTitle>Create Badge</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Icon Emoji</Label>
                <Input value={iconEmoji} onChange={(e) => setIconEmoji(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Unlock Type</Label>
                <Select value={unlockType} onValueChange={setUnlockType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MIN_XP">Min XP</SelectItem>
                    <SelectItem value="MIN_CHALLENGES_COMPLETED">Min Challenges</SelectItem>
                    <SelectItem value="MIN_CSR_ACTIVITIES">Min CSR Activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Threshold</Label>
                <Input type="number" value={unlockThreshold} onChange={(e) => setUnlockThreshold(e.target.value)} required />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <TableSkeleton key={i} />)
        ) : !badges?.length ? (
          <div className="col-span-full">
            <EmptyState title="No badges" description="Create badges to motivate employees" />
          </div>
        ) : (
          badges.map((badge: any) => (
            <Card key={badge.id}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">{badge.iconEmoji}</div>
                <h3 className="font-semibold">{badge.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {badge.unlockType.replace(/_/g, ' ')} &ge; {badge.unlockThreshold}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
