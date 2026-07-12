'use client'
import { useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Loader2, Download, Leaf, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('carbon')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [exportFormat, setExportFormat] = useState('csv')
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: reportType })
      if (fromDate) params.set('from', new Date(fromDate).toISOString())
      if (toDate) params.set('to', new Date(toDate).toISOString())

      if (exportFormat === 'pdf') {
        params.set('format', 'json')
        const res = await fetch(`/api/reports/export?${params}`)
        if (!res.ok) throw new Error('Export failed')
        const json = await res.json()
        const data = json.data
        
        if (data && data.length > 0) {
          const doc = new jsPDF('landscape')
          doc.text(`${reportType === 'carbon' ? 'Carbon Emissions' : 'Compliance Issues'} Report`, 14, 15)
          const keys = Object.keys(data[0])
          const rows = data.map((item: any) => keys.map((k) => String(item[k])))
          
          autoTable(doc, {
            head: [keys],
            body: rows,
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 160, 133] }
          })
          
          doc.save(`${reportType}-report.pdf`)
        }
      } else {
        const res = await fetch(`/api/reports/export?${params}`)
        if (!res.ok) throw new Error('Export failed')

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${reportType}-report.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Export ESG data as CSV reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Export Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carbon">
                    <div className="flex items-center gap-2"><Leaf className="h-4 w-4" />Carbon Emissions</div>
                  </SelectItem>
                  <SelectItem value="governance">
                    <div className="flex items-center gap-2"><Shield className="h-4 w-4" />Compliance Issues</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="pdf">PDF (Document)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleExport} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Download {exportFormat.toUpperCase()}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Carbon Emissions Report</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">All carbon transactions with emission factors, departments, and totals</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">Compliance Issues Report</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">All compliance issues with severity, status, owners, and due dates</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
