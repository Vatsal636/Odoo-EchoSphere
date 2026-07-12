'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Loader2, Plus, Shield, ClipboardCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { ApiResponse } from '@/types/api.types'
import { useToast } from '@/components/ui/toast'

export default function AuditDetailPage() {
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issueTitle, setIssueTitle] = useState('')
  const [issueDesc, setIssueDesc] = useState('')
  const [severity, setSeverity] = useState('MEDIUM')
  const [ownerId, setOwnerId] = useState('')
  const [dueDate, setDueDate] = useState('')

  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit', id],
    queryFn: async () => {
      const res = await fetch(`/api/audits/${id}`)
      const json: ApiResponse<any> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const { data: users } = useQuery({
    queryKey: ['users-for-audit'],
    queryFn: async () => {
      const res = await fetch('/api/departments')
      const json: ApiResponse<any[]> = await res.json()
      if (!json.success) return []
      return json.data?.flatMap((d: any) => d.members ?? []) ?? []
    },
    enabled: isAdmin && showIssueForm,
  })

  const addIssueMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/audits/${id}/issues`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit', id] })
      setShowIssueForm(false); setIssueTitle(''); setIssueDesc(''); setDueDate(''); setOwnerId('')
      toast('Issue added successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to add issue', 'error')
    },
  })

  const resolveIssueMutation = useMutation({
    mutationFn: async ({ issueId, status }: { issueId: string; status: string }) => {
      const res = await fetch(`/api/audits/${id}/issues?issueId=${issueId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, resolution: 'Marked as resolved' }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit', id] })
      toast('Issue resolved successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to resolve issue', 'error')
    },
  })

  if (isLoading) return <LoadingSkeleton className="h-64 w-full" />
  if (!audit) return <div className="text-destructive">Audit not found</div>

  const issues = audit.complianceIssues ?? []

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">{audit.title}</h1>
          <StatusBadge status={audit.status} />
        </div>
        <p className="text-muted-foreground mt-1">{audit.scope}</p>
        {audit.description && <p className="text-sm text-muted-foreground mt-2">{audit.description}</p>}
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Status', value: audit.status, color: 'text-blue-600' },
          { label: 'Start Date', value: formatDate(audit.startDate) },
          { label: 'End Date', value: formatDate(audit.endDate) },
          { label: 'Issues Found', value: issues.length, color: issues.length > 0 ? 'text-amber-600' : 'text-emerald-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <p className={`text-2xl font-bold tracking-tight ${stat.color ?? ''}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-sm border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-purple-500" />
            Compliance Issues ({issues.length})
          </CardTitle>
          {isAdmin && (
            <Button onClick={() => setShowIssueForm(!showIssueForm)} size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />{showIssueForm ? 'Cancel' : 'Add Issue'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showIssueForm && isAdmin && (
            <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              onSubmit={(e) => { e.preventDefault(); addIssueMutation.mutate({ title: issueTitle, description: issueDesc, severity, ownerId, dueDate: new Date(dueDate).toISOString() }) }}
              className="mb-6 rounded-lg border p-4 space-y-3 bg-muted/30"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} required placeholder="Issue title" /></div>
                <div className="space-y-1"><Label className="text-xs">Severity</Label><Select value={severity} onValueChange={setSeverity}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LOW">Low</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HIGH">High</SelectItem><SelectItem value="CRITICAL">Critical</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label className="text-xs">Owner</Label><Select value={ownerId} onValueChange={setOwnerId}><SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger><SelectContent>{(users ?? []).map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1"><Label className="text-xs">Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Description</Label><Input value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} required placeholder="Issue description" /></div>
              <Button type="submit" size="sm" disabled={addIssueMutation.isPending}>{addIssueMutation.isPending ? 'Adding...' : 'Add Issue'}</Button>
            </motion.form>
          )}

          {!issues.length ? (
            <EmptyState title="No issues" description="No compliance issues recorded for this audit" />
          ) : (
            <div className="space-y-2">
              {issues.map((issue: any) => (
                <div key={issue.id} className="rounded-lg border p-3 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{issue.title}</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={issue.severity} />
                      <StatusBadge status={issue.status} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{issue.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>Due: {issue.dueDate ? formatDate(issue.dueDate) : 'N/A'}</span>
                    {issue.owner?.name && <span>· Owner: {issue.owner.name}</span>}
                  </div>
                  {(issue.status === 'OPEN' || issue.status === 'IN_PROGRESS') && (
                    <Button size="sm" variant="ghost" className="mt-2 text-xs text-emerald-600 gap-1"
                      onClick={() => resolveIssueMutation.mutate({ issueId: issue.id, status: 'RESOLVED' })}>
                      <CheckIcon className="h-3 w-3" /> Mark Resolved
                    </Button>
                  )}
                  {issue.resolution && <p className="text-xs text-muted-foreground mt-1 italic">Resolution: {issue.resolution}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}
