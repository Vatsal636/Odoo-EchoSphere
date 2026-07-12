'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { formatDate } from '@/lib/utils'
import type { ApiResponse } from '@/types/api.types'
import { useToast } from '@/components/ui/toast'

export default function ChallengesPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [xpReward, setXpReward] = useState('')
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [deadline, setDeadline] = useState('')

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const res = await fetch('/api/challenges')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['categories', 'CHALLENGE'],
    queryFn: async () => {
      const res = await fetch('/api/categories?type=CHALLENGE')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/challenges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
      setShowForm(false); setTitle(''); setCategoryId('')
      toast('Challenge created successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to create challenge', 'error')
    },
  })

  const transitionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/challenges?id=${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
      toast('Challenge status updated successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to update challenge status', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ title, description, xpReward: parseInt(xpReward), difficulty, categoryId, deadline: new Date(deadline) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground">Create and manage employee challenges</p>
        </div>
        {isAdmin && <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />New Challenge</Button>}
      </div>

      {isAdmin && showForm && (
        <Card>
          <CardHeader><CardTitle>Create Challenge</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>XP Reward</Label>
                <Input type="number" value={xpReward} onChange={(e) => setXpReward(e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>All Challenges</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton rows={4} /> : !challenges?.length ? (
            <EmptyState title="No challenges" description="Create your first challenge" />
          ) : (
            <div className="space-y-3">
              {challenges.map((challenge: any) => (
                <div key={challenge.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/gamification/challenges/${challenge.id}`} className="font-medium hover:underline">{challenge.title}</Link>
                      <p className="text-xs text-muted-foreground mt-1">{challenge.xpReward} XP · {challenge.difficulty} · {formatDate(challenge.deadline)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && (challenge.status === 'DRAFT' || challenge.status === 'ACTIVE' || challenge.status === 'UNDER_REVIEW') && (
                        <>
                          {challenge.status === 'DRAFT' && (
                            <Button size="sm" variant="outline" onClick={() => transitionMutation.mutate({ id: challenge.id, status: 'ACTIVE' })}>
                              {transitionMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Activate'}
                            </Button>
                          )}
                          {challenge.status === 'ACTIVE' && (
                            <Button size="sm" variant="outline" onClick={() => transitionMutation.mutate({ id: challenge.id, status: 'UNDER_REVIEW' })}>Review</Button>
                          )}
                          {challenge.status === 'UNDER_REVIEW' && (
                            <Button size="sm" variant="outline" onClick={() => transitionMutation.mutate({ id: challenge.id, status: 'COMPLETED' })}>Complete</Button>
                          )}
                        </>
                      )}
                      <StatusBadge status={challenge.status} />
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
