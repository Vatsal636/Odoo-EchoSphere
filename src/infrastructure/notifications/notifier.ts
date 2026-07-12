import { prisma } from '@/infrastructure/db/prisma'
import type { NotificationType, Prisma } from '@prisma/client'

interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  metadata?: Prisma.InputJsonValue
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input })
}

export async function createBulkNotifications(
  inputs: CreateNotificationInput[]
) {
  if (inputs.length === 0) return []
  return prisma.notification.createMany({ data: inputs })
}
