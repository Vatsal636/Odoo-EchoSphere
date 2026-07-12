import { z } from 'zod/v4'

export const CreateCarbonTransactionSchema = z.object({
  source: z.string().min(1).max(200),
  amount: z.coerce.number().positive(),
  unit: z.string().optional(),
  emissionFactorId: z.string().min(1),
  departmentId: z.string().min(1),
  date: z.coerce.date(),
  notes: z.string().max(1000).optional(),
})

export const CreateEmissionFactorSchema = z.object({
  name: z.string().min(1).max(200),
  factor: z.number().positive(),
  unit: z.string().min(1),
  scope: z.enum(['Scope 1', 'Scope 2', 'Scope 3']),
})

export const CreateEnvironmentalGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  targetKg: z.number().positive(),
  deadline: z.coerce.date(),
  departmentId: z.string().min(1),
})
