'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { formatDate, formatNumber } from '@/lib/utils'
import type { ApiResponse } from '@/types/api.types'

export default function EnvironmentalGoalsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [targetKg, setTargetKg] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [deadline, setDeadline] = useState('')

  const { data: goals, isLoading } = useQuery({
    queryKey: ['environmental-goals'],
    queryFn: async () => {
      const res = await fetch('/api/environmental-goals')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await fetch('/api/departments')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/environmental-goals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environmental-goals'] })
      setShowForm(false); setTitle(''); setTargetKg(''); setDepartmentId('')
      toast('Goal created successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to create goal', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ title, targetKg: parseFloat(targetKg), departmentId, deadline: new Date(deadline) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Environmental Goals</h1>
          <p className="text-muted-foreground">Set and track emission reduction targets</p>
        </div>
        {isAdmin && <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />New Goal</Button>}
      </div>

      {isAdmin && showForm && (
        <Card>
          <CardHeader><CardTitle>Create Goal</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Target (kg CO₂)</Label>
                <Input type="number" step="0.01" value={targetKg} onChange={(e) => setTargetKg(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>All Goals</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton rows={3} /> : !goals?.length ? (
            <EmptyState title="No goals" description="Create your first environmental goal" />
          ) : (
            <div className="space-y-3">
              {goals.map((goal: any) => (
                <div key={goal.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Target: {formatNumber(goal.targetKg)} {goal.unit} · {goal.department?.name} · Due: {formatDate(goal.deadline)}
                    </p>
                  </div>
                  <StatusBadge status={goal.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
