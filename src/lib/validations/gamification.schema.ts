import { z } from 'zod/v4'

export const CreateChallengeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  categoryId: z.string().min(1),
  xpReward: z.number().int().positive(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  evidenceRequired: z.boolean().default(true),
  deadline: z.coerce.date(),
})

export const UpdateChallengeStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED']),
})

export const CreateBadgeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  iconEmoji: z.string().default('🏅'),
  unlockType: z.enum(['MIN_XP', 'MIN_CHALLENGES_COMPLETED', 'MIN_CSR_ACTIVITIES']),
  unlockThreshold: z.number().int().positive(),
})

export const CreateRewardSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  pointsRequired: z.number().int().positive(),
  stock: z.number().int().positive(),
})
