import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CreatePolicySchema } from '@/lib/validations/governance.schema'
import { listPolicies, createPolicy } from '@/infrastructure/repositories/governance.repository'
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

    const policies = await listPolicies({ status })
    return NextResponse.json({ success: true, data: policies })
  } catch (error) {
    console.error('Policies error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch policies' } }, { status: 500 })
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
    const parsed = CreatePolicySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const policy = await createPolicy({
      ...parsed.data,
      status: 'DRAFT',
      createdBy: { connect: { id: session.user.id } },
    })

    const users = await prisma.user.findMany({ where: { isActive: true } })
    await Promise.all(users.map(u => 
      createNotification({
        userId: u.id,
        type: 'POLICY_CREATED',
        title: 'New Policy Published',
        message: `A new policy "${policy.title}" has been published. Please review it.`,
        metadata: { policyId: policy.id },
      })
    ))

    return NextResponse.json({ success: true, data: policy }, { status: 201 })
  } catch (error) {
    console.error('Create policy error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create policy' } }, { status: 500 })
  }
}
