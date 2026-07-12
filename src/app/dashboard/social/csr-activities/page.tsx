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

export default function CSRActivitiesPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [points, setPoints] = useState('10')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: activities, isLoading } = useQuery({
    queryKey: ['csr-activities'],
    queryFn: async () => {
      const res = await fetch('/api/csr-activities')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['categories', 'CSR_ACTIVITY'],
    queryFn: async () => {
      const res = await fetch('/api/categories?type=CSR_ACTIVITY')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/csr-activities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csr-activities'] })
      setShowForm(false); setTitle(''); setDescription(''); setCategoryId(''); setPoints('10')
      toast('Activity created successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to create activity', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ title, description, categoryId, points: parseInt(points), startDate: new Date(startDate), endDate: new Date(endDate) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CSR Activities</h1>
          <p className="text-muted-foreground">Corporate social responsibility activities</p>
        </div>
        {isAdmin && <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />New Activity</Button>}
      </div>

      {isAdmin && showForm && (
        <Card>
          <CardHeader><CardTitle>Create Activity</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>All Activities</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton rows={4} /> : !activities?.length ? (
            <EmptyState title="No activities" description="Create CSR activities to engage employees" />
          ) : (
            <div className="space-y-3">
              {activities.map((activity: any) => (
                <Link key={activity.id} href={`/dashboard/social/csr-activities/${activity.id}`}>
                  <div className="rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(activity.startDate)} - {formatDate(activity.endDate)} · {activity._count?.participations ?? 0} participants
                        </p>
                      </div>
                      <StatusBadge status={activity.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
