import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CreateBadgeSchema } from '@/lib/validations/gamification.schema'
import { prisma } from '@/infrastructure/db/prisma'
import { listBadges } from '@/infrastructure/repositories/gamification.repository'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
    }

    const badges = await listBadges()
    return NextResponse.json({ success: true, data: badges })
  } catch (error) {
    console.error('Badges error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch badges' } }, { status: 500 })
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
    const parsed = CreateBadgeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten() },
      }, { status: 400 })
    }

    const badge = await prisma.badge.create({ data: parsed.data })
    return NextResponse.json({ success: true, data: badge }, { status: 201 })
  } catch (error) {
    console.error('Create badge error:', error)
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create badge' } }, { status: 500 })
  }
}
