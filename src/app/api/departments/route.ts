import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listDepartments } from '@/infrastructure/repositories/department.repository'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const departments = await listDepartments()
    return NextResponse.json({ success: true, data: departments })
  } catch (error) {
    console.error('Departments error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch departments' } }, { status: 500 })
  }
}
