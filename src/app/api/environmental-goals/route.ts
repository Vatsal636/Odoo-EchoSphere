import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CreateEnvironmentalGoalSchema } from '@/lib/validations/carbon.schema'
import { listEnvironmentalGoals, createEnvironmentalGoal } from '@/infrastructure/repositories/carbon.repository'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const url = new URL(request.url)
    const departmentId = url.searchParams.get('departmentId') ?? undefined

    const goals = await listEnvironmentalGoals({ departmentId })
    return NextResponse.json({ success: true, data: goals })
  } catch (error) {
    console.error('Environmental goals error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch goals' } }, { status: 500 })
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
    const parsed = CreateEnvironmentalGoalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const goal = await createEnvironmentalGoal({
      ...parsed.data,
      currentKg: 0,
      unit: 'kg CO2',
      status: 'ON_TRACK',
    } as any)

    return NextResponse.json({ success: true, data: goal }, { status: 201 })
  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create goal' } }, { status: 500 })
  }
}
