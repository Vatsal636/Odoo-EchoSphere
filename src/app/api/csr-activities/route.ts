import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CreateCSRActivitySchema } from '@/lib/validations/social.schema'
import { listCSRActivities, createCSRActivity } from '@/infrastructure/repositories/social.repository'
import { createNotification } from '@/infrastructure/notifications/notifier'
import { prisma } from '@/infrastructure/db/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? undefined

    const activities = await listCSRActivities({ status })
    return NextResponse.json({ success: true, data: activities })
  } catch (error) {
    console.error('CSR activities error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch CSR activities' } }, { status: 500 })
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
    const parsed = CreateCSRActivitySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const { categoryId, ...rest } = parsed.data
    const activity = await createCSRActivity({
      ...rest,
      status: 'UPCOMING',
      category: { connect: { id: categoryId } },
      createdBy: { connect: { id: session.user.id } },
    })

    const users = await prisma.user.findMany({ where: { isActive: true } })
    await Promise.all(users.map(u => 
      createNotification({
        userId: u.id,
        type: 'CSR_ACTIVITY_CREATED',
        title: 'New CSR Activity',
        message: `A new CSR activity "${activity.title}" has been scheduled.`,
        metadata: { activityId: activity.id },
      })
    ))

    return NextResponse.json({ success: true, data: activity }, { status: 201 })
  } catch (error) {
    console.error('Create CSR activity error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create activity' } }, { status: 500 })
  }
}
