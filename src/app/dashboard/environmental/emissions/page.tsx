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

export default function EmissionsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [source, setSource] = useState('')
  const [amount, setAmount] = useState('')
  const [emissionFactorId, setEmissionFactorId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['carbon-transactions'],
    queryFn: async () => {
      const res = await fetch('/api/carbon-transactions')
      const json: ApiResponse<any> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
  })

  const { data: factors } = useQuery({
    queryKey: ['emission-factors'],
    queryFn: async () => {
      const res = await fetch('/api/emission-factors')
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
      const res = await fetch('/api/carbon-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) {
        const detail = json.error?.details ? JSON.stringify(json.error.details) : ''
        throw new Error(`${json.error.message}${detail ? `: ${detail}` : ''}`)
      }
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbon-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['esg-score'] })
      setShowForm(false)
      setSource('')
      setAmount('')
      setEmissionFactorId('')
      setDepartmentId('')
      toast('Emission logged successfully')
    },
    onError: (err: any) => {
      toast(err?.message || 'Failed to log emission', 'error')
    },
  })

  const [formError, setFormError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!emissionFactorId) { setFormError('Please select an emission factor'); return }
    if (!departmentId) { setFormError('Please select a department'); return }
    if (!source.trim()) { setFormError('Please enter a source'); return }
    if (!amount || Number(amount) <= 0) { setFormError('Please enter a valid amount'); return }
    createMutation.mutate({ source: source.trim(), amount: Number(amount), emissionFactorId, departmentId, date })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carbon Emissions</h1>
          <p className="text-muted-foreground">Record and track carbon transactions</p>
        </div>
        {isAdmin && <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />Log Emission
        </Button>}
      </div>

      {isAdmin && showForm && (
        <Card>
          <CardHeader><CardTitle>Log Carbon Transaction</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input id="source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g., Diesel generator" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 100" required />
              </div>
              <div className="space-y-2">
                <Label>Emission Factor</Label>
                <Select value={emissionFactorId} onValueChange={setEmissionFactorId}>
                  <SelectTrigger><SelectValue placeholder="Select factor" /></SelectTrigger>
                  <SelectContent>
                    {factors?.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>{f.name} ({f.factor} {f.unit})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit
                </Button>
              </div>
              {(createMutation.isError || formError) && (
                <div className="col-span-2 text-sm text-destructive">
                  {formError || (createMutation.error as Error)?.message}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : !transactions?.length ? (
            <EmptyState title="No transactions" description="Log your first carbon emission transaction" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Source</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">CO₂ (kg)</th>
                    <th className="pb-3 font-medium">Scope</th>
                    <th className="pb-3 font-medium">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b last:border-b-0">
                      <td className="py-3">{formatDate(tx.date)}</td>
                      <td className="py-3">{tx.source}</td>
                      <td className="py-3">{formatNumber(tx.amount)} {tx.unit}</td>
                      <td className="py-3 font-medium">{formatNumber(tx.totalEmissions)}</td>
                      <td className="py-3"><StatusBadge status={tx.emissionFactor?.scope ?? ''} /></td>
                      <td className="py-3">{tx.department?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
