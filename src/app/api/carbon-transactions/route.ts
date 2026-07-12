import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CreateCarbonTransactionSchema } from '@/lib/validations/carbon.schema'
import { createCarbonTransaction, getCarbonTransactions } from '@/infrastructure/repositories/carbon.repository'
import { calculateCarbonEmissions } from '@/domain/carbon/calculator'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const url = new URL(request.url)
    const departmentId = url.searchParams.get('departmentId') ?? undefined
    const from = url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : undefined
    const to = url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : undefined
    const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined
    const pageSize = url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize')!) : undefined

    const result = await getCarbonTransactions({ departmentId, from, to, page, pageSize })
    return NextResponse.json({ success: true, data: result.data, meta: { page: result.page, total: result.total, pageSize: result.pageSize } })
  } catch (error) {
    console.error('Carbon transactions error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch carbon transactions' } }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin or Manager access required' } }, { status: 403 })
    }

    const body = await request.json()
    const parsed = CreateCarbonTransactionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const { emissionFactorId, amount, departmentId, unit: _unit, ...rest } = parsed.data

    const { prisma } = await import('@/infrastructure/db/prisma')
    const factor = await prisma.emissionFactor.findUnique({ where: { id: emissionFactorId } })
    if (!factor) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Emission factor not found' } }, { status: 404 })
    }

    const totalEmissions = calculateCarbonEmissions(amount, factor.factor)

    const transaction = await createCarbonTransaction({
      ...rest,
      source: rest.source,
      amount,
      unit: factor.unit,
      totalEmissions,
      date: rest.date,
      emissionFactor: { connect: { id: emissionFactorId } },
      department: { connect: { id: departmentId } },
      user: { connect: { id: session.user.id } },
    })

    return NextResponse.json({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    console.error('Create carbon transaction error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create transaction' } }, { status: 500 })
  }
}
