import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CreateComplianceIssueSchema, UpdateComplianceIssueSchema } from '@/lib/validations/governance.schema'
import { createComplianceIssue, updateComplianceIssue } from '@/infrastructure/repositories/governance.repository'
import { createNotification } from '@/infrastructure/notifications/notifier'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = CreateComplianceIssueSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const issue = await createComplianceIssue({
      ...parsed.data,
      status: 'OPEN',
      audit: { connect: { id } },
      owner: { connect: { id: parsed.data.ownerId } },
    } as any)

    await createNotification({
      userId: parsed.data.ownerId,
      type: 'COMPLIANCE_ISSUE_ASSIGNED',
      title: 'New Compliance Issue',
      message: `You have been assigned a new compliance issue: "${issue.title}".`,
      metadata: { issueId: issue.id, auditId: id },
    })

    return NextResponse.json({ success: true, data: issue }, { status: 201 })
  } catch (error) {
    console.error('Create issue error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create issue' } }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin or Manager access required' } }, { status: 403 })
    }

    const { id } = await params
    const url = new URL(request.url)
    const issueId = url.searchParams.get('issueId')
    if (!issueId) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'issueId query param required' } }, { status: 400 })
    }

    const body = await request.json()
    const parsed = UpdateComplianceIssueSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const issue = await updateComplianceIssue(issueId, parsed.data as any)

    return NextResponse.json({ success: true, data: issue })
  } catch (error) {
    console.error('Update issue error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update issue' } }, { status: 500 })
  }
}
