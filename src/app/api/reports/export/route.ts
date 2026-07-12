import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/infrastructure/db/prisma'
import { unparse } from 'papaparse'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type') ?? 'carbon'
    const format = url.searchParams.get('format') ?? 'csv'
    const from = url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    const to = url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : new Date()

    if (type === 'carbon') {
      const transactions = await prisma.carbonTransaction.findMany({
        where: { date: { gte: from, lte: to } },
        include: {
          department: { select: { name: true, code: true } },
          emissionFactor: { select: { name: true, scope: true } },
          user: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      })

      const rows = transactions.map((t) => ({
        Date: t.date.toISOString().split('T')[0],
        Source: t.source,
        Amount: t.amount,
        Unit: t.unit,
        'Total Emissions (kg CO2e)': t.totalEmissions,
        Scope: t.emissionFactor.scope,
        'Emission Factor': t.emissionFactor.name,
        Department: t.department.name,
        'Department Code': t.department.code,
        'Recorded By': t.user.name,
        Notes: t.notes ?? '',
      }))

      if (format === 'json') {
        return NextResponse.json({ success: true, data: rows })
      }

      const csv = unparse(rows)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="carbon-emissions-${from.toISOString().split('T')[0]}-to-${to.toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    if (type === 'governance') {
      const issues = await prisma.complianceIssue.findMany({
        where: { createdAt: { gte: from, lte: to } },
        include: {
          audit: { select: { title: true } },
          owner: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      const rows = issues.map((i) => ({
        Title: i.title,
        Severity: i.severity,
        Status: i.status,
        'Due Date': i.dueDate.toISOString().split('T')[0],
        Owner: i.owner.name,
        'Owner Email': i.owner.email,
        Audit: i.audit.title,
        Resolution: i.resolution ?? '',
      }))

      if (format === 'json') {
        return NextResponse.json({ success: true, data: rows })
      }

      const csv = unparse(rows)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="compliance-issues-${from.toISOString().split('T')[0]}-to-${to.toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid export type. Supported: carbon, governance' } }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to export data' } }, { status: 500 })
  }
}
