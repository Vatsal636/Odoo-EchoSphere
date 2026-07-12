import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { acknowledgePolicy, findPolicyById } from '@/infrastructure/repositories/governance.repository'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const { id } = await params

    const policy = await findPolicyById(id)
    if (!policy) {
      return NextResponse.json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Policy not found' } }, { status: 404 })
    }

    if (policy.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: { code: 'UNPROCESSABLE', message: 'Only active policies can be acknowledged' } }, { status: 422 })
    }

    const acknowledgement = await acknowledgePolicy(id, session.user.id)

    return NextResponse.json({ success: true, data: acknowledgement })
  } catch (error) {
    console.error('Acknowledge policy error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to acknowledge policy' } }, { status: 500 })
  }
}
