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

export function evaluateBadges(
  allBadges: BadgeCandidate[],
  alreadyEarned: Set<string>,
  progress: UserProgress
): string[] {
  return allBadges
    .filter((badge) => !alreadyEarned.has(badge.id))
    .filter((badge) => {
      const { type, threshold } = badge.unlockRule
      switch (type) {
        case 'MIN_XP':
          return progress.totalXP >= threshold
        case 'MIN_CHALLENGES_COMPLETED':
          return progress.completedChallenges >= threshold
        case 'MIN_CSR_ACTIVITIES':
          return progress.approvedCSRActivities >= threshold
        default:
          return false
      }
    })
    .map((badge) => badge.id)
}
