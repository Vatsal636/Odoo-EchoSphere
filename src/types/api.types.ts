export type ApiSuccess<T> = {
  success: true
  data: T
  meta?: { page?: number; total?: number; pageSize?: number }
}

export type ApiError = {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface DashboardSummary {
  totalEmployees: number
  activeDepartments: number
  pendingParticipations: number
  overdueIssues: number
  totalBadgesAwarded: number
}

export interface ESGScoreData {
  overall: number
  environmental: number
  social: number
  governance: number
  departments: Array<{
    id: string
    name: string
    score: number
    environmental: number
    social: number
    governance: number
  }>
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}
