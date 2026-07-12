import { z } from 'zod/v4'

export const CreatePolicySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  effectiveDate: z.coerce.date(),
})

export const CreateAuditSchema = z.object({
  title: z.string().min(1).max(200),
  scope: z.string().min(1).max(1000),
  description: z.string().max(5000).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
})

export const CreateComplianceIssueSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  ownerId: z.string().min(1),
  dueDate: z.coerce.date(),
})

export const UpdateComplianceIssueSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']).optional(),
  resolution: z.string().max(5000).optional(),
})
