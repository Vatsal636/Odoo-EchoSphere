'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Loader2, Check, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { ApiResponse } from '@/types/api.types'
import { useToast } from '@/components/ui/toast'

export default function PoliciesPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')

  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const res = await fetch('/api/policies')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/policies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      setShowForm(false); setTitle(''); setDescription(''); setEffectiveDate('')
      toast('Policy created successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to create policy', 'error')
    },
  })

  const acknowledgeMutation = useMutation({
    mutationFn: async (policyId: string) => {
      const res = await fetch(`/api/policies/${policyId}/acknowledge`, { method: 'POST' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      toast('Policy acknowledged successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to acknowledge policy', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ title, description, effectiveDate: new Date(effectiveDate).toISOString() })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Policies</h1>
          <p className="text-muted-foreground text-sm">Manage ESG policies and acknowledgements</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />{showForm ? 'Cancel' : 'New Policy'}
          </Button>
        )}
      </div>

      {showForm && isAdmin && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold">Create New Policy</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Policy title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Effective Date</Label>
              <Input id="date" type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Policy description" required rows={3}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <Button type="submit" disabled={createMutation.isPending} className="gap-2">
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createMutation.isPending ? 'Creating...' : 'Create Policy'}
          </Button>
        </motion.form>
      )}

      <Card className="shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-500" />
            All Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton rows={5} /> : !policies?.length ? (
            <EmptyState title="No policies" description={isAdmin ? 'Create your first policy' : 'No policies available'} />
          ) : (
            <div className="space-y-2">
              {policies.map((policy: any) => (
                <div key={policy.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 hover:bg-accent/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{policy.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{policy.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>Effective: {policy.effectiveDate ? formatDate(policy.effectiveDate) : 'N/A'}</span>
                      <span>·</span>
                      <span>{policy._count?.acknowledgements ?? 0} acknowledgement{(policy._count?.acknowledgements ?? 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={policy.status} />
                    {!isAdmin && (
                      <Button
                        size="sm" variant="outline" className="gap-1.5"
                        onClick={() => acknowledgeMutation.mutate(policy.id)}
                        disabled={acknowledgeMutation.isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Acknowledge
                      </Button>
                    )}
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
