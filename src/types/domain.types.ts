export interface ModuleScores {
  environmental: number
  social: number
  governance: number
}

export interface ESGWeights {
  environmental: number
  social: number
  governance: number
}

export interface BadgeUnlockRule {
  type: 'MIN_XP' | 'MIN_CHALLENGES_COMPLETED' | 'MIN_CSR_ACTIVITIES'
  threshold: number
}

export interface BadgeCandidate {
  id: string
  name: string
  unlockRule: BadgeUnlockRule
}

export interface UserProgress {
  totalXP: number
  completedChallenges: number
  approvedCSRActivities: number
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

export interface DashboardSummary {
  totalEmployees: number
  activeDepartments: number
  pendingParticipations: number
  overdueIssues: number
  totalBadgesAwarded: number
}
