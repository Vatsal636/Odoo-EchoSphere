import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listEmissionFactors } from '@/infrastructure/repositories/carbon.repository'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const factors = await listEmissionFactors()
    return NextResponse.json({ success: true, data: factors })
  } catch (error) {
    console.error('Emission factors error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch emission factors' } }, { status: 500 })
  }
}
