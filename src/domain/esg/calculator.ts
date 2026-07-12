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

const DEFAULT_WEIGHTS: ESGWeights = {
  environmental: 0.40,
  social: 0.30,
  governance: 0.30,
}

export function calculateESGScore(
  scores: ModuleScores,
  weights: ESGWeights = DEFAULT_WEIGHTS
): number {
  const total = weights.environmental + weights.social + weights.governance
  if (Math.abs(total - 1.0) > 0.001) {
    throw new Error(`Weights must sum to 1.0, got ${total}`)
  }
  const score =
    scores.environmental * weights.environmental +
    scores.social * weights.social +
    scores.governance * weights.governance
  return Math.round(Math.max(0, Math.min(100, score)) * 10) / 10
}

export function calculateEnvironmentalScore(
  totalEmissions: number,
  emissionGoalKg: number | null
): number {
  if (!emissionGoalKg || emissionGoalKg <= 0) return 50
  const ratio = totalEmissions / emissionGoalKg
  return Math.max(0, Math.min(100, Math.round((1 - ratio) * 100)))
}

export function calculateSocialScore(
  approvedParticipations: number,
  totalParticipations: number,
  policyAcknowledgementRate: number
): number {
  if (totalParticipations === 0) return 0
  const participationScore = (approvedParticipations / totalParticipations) * 70
  const policyScore = policyAcknowledgementRate * 30
  return Math.round(participationScore + policyScore)
}

export function calculateGovernanceScore(
  acknowledgedPolicies: number,
  totalActivePolicies: number,
  openCriticalIssues: number,
  overdueIssues: number
): number {
  const ackRate = totalActivePolicies > 0
    ? acknowledgedPolicies / totalActivePolicies
    : 0
  const ackScore = ackRate * 60
  const issuesPenalty = Math.min(40, openCriticalIssues * 8 + overdueIssues * 4)
  return Math.round(Math.max(0, ackScore + (40 - issuesPenalty)))
}
