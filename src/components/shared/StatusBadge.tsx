import { Badge } from '@/components/ui/badge'

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'> = {
  ACTIVE: 'success',
  COMPLETED: 'success',
  APPROVED: 'success',
  RESOLVED: 'success',
  ON_TRACK: 'success',
  DRAFT: 'outline',
  UPCOMING: 'outline',
  PENDING: 'warning',
  AT_RISK: 'warning',
  IN_PROGRESS: 'warning',
  UNDER_REVIEW: 'warning',
  OPEN: 'warning',
  REJECTED: 'destructive',
  MISSED: 'destructive',
  OVERDUE: 'destructive',
  CANCELLED: 'destructive',
  ARCHIVED: 'secondary',
  PLANNED: 'secondary',
  DISCONTINUED: 'secondary',
  OUT_OF_STOCK: 'destructive',
}

export function StatusBadge({ status }: { status: string }) {
  const variant = statusVariants[status] ?? 'default'
  return <Badge variant={variant}>{status.replace(/_/g, ' ')}</Badge>
}
