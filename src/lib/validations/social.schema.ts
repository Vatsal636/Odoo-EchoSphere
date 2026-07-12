import { z } from 'zod/v4'

export const CreateCSRActivitySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  categoryId: z.string().min(1),
  points: z.number().int().positive().default(10),
  maxParticipants: z.number().int().positive().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
})

export const CreateParticipationSchema = z.object({
  proofUrl: z.string().url().optional().or(z.literal('')),
})

export const ReviewParticipationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNote: z.string().max(500).optional(),
})
