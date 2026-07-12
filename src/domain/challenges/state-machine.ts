export type ChallengeStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'ARCHIVED'

const VALID_TRANSITIONS: Record<ChallengeStatus, ChallengeStatus[]> = {
  DRAFT: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['UNDER_REVIEW', 'ARCHIVED'],
  UNDER_REVIEW: ['COMPLETED', 'ACTIVE', 'ARCHIVED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: [],
}

export function canTransition(
  from: ChallengeStatus,
  to: ChallengeStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

export function assertTransition(
  from: ChallengeStatus,
  to: ChallengeStatus
): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid challenge transition: ${from} → ${to}. ` +
        `Allowed: ${VALID_TRANSITIONS[from]?.join(', ') ?? 'none'}`
    )
  }
}
