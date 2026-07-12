import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findAuditById } from '@/infrastructure/repositories/governance.repository'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const { id } = await params
    const audit = await findAuditById(id)
    if (!audit) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Audit not found' } }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: audit })
  } catch (error) {
    console.error('Audit detail error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch audit' } }, { status: 500 })
  }
}
