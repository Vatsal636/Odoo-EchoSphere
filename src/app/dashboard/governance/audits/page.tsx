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
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { formatDate } from '@/lib/utils'
import type { ApiResponse } from '@/types/api.types'
import { useToast } from '@/components/ui/toast'

export default function AuditsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [scope, setScope] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: audits, isLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      const res = await fetch('/api/audits')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/audits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] })
      setShowForm(false); setTitle(''); setScope('')
      toast('Audit scheduled successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to schedule audit', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ title, scope, description, startDate: new Date(startDate), endDate: new Date(endDate) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audits</h1>
          <p className="text-muted-foreground">Schedule and manage ESG audits</p>
        </div>
        {isAdmin && <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />New Audit</Button>}
      </div>

      {isAdmin && showForm && (
        <Card>
          <CardHeader><CardTitle>Schedule Audit</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <Input value={scope} onChange={(e) => setScope(e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
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
        <CardHeader><CardTitle>All Audits</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton rows={4} /> : !audits?.length ? (
            <EmptyState title="No audits" description="Schedule your first audit" />
          ) : (
            <div className="space-y-3">
              {audits.map((audit: any) => (
                <Link key={audit.id} href={`/governance/audits/${audit.id}`}>
                  <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium">{audit.title}</p>
                      <p className="text-xs text-muted-foreground">{audit.scope} · {formatDate(audit.startDate)} - {formatDate(audit.endDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{audit._count?.complianceIssues ?? 0} issues</span>
                      <StatusBadge status={audit.status} />
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
