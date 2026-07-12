import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CreateAuditSchema } from '@/lib/validations/governance.schema'
import { listAudits, createAudit } from '@/infrastructure/repositories/governance.repository'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const audits = await listAudits()
    return NextResponse.json({ success: true, data: audits })
  } catch (error) {
    console.error('Audits error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch audits' } }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } }, { status: 403 })
    }

    const body = await request.json()
    const parsed = CreateAuditSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const audit = await createAudit({
      ...parsed.data,
      status: 'PLANNED',
      auditor: { connect: { id: session.user.id } },
    } as any)

    return NextResponse.json({ success: true, data: audit }, { status: 201 })
  } catch (error) {
    console.error('Create audit error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit' } }, { status: 500 })
  }
}
