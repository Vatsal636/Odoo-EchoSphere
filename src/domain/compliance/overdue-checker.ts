export interface ComplianceIssueData {
  id: string
  status: string
  dueDate: Date
}

export function checkOverdueIssues(
  issues: ComplianceIssueData[],
  now: Date = new Date()
): string[] {
  return issues
    .filter(
      (issue) =>
        (issue.status === 'OPEN' || issue.status === 'IN_PROGRESS') &&
        issue.dueDate < now
    )
    .map((issue) => issue.id)
}
