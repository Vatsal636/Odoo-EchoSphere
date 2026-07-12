import { useESGScore } from '@/hooks/useESGScore'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'

function ScoreBar({ value }: { value: number }) {
  const color = value >= 75 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium w-8 text-right tabular-nums">{value}</span>
    </div>
  )
}

export function DeptScoreTable() {
  const { data, isLoading, error } = useESGScore()

  if (isLoading) return <TableSkeleton rows={3} />
  if (error) return <div className="text-destructive text-sm">{error.message}</div>
  if (!data?.departments?.length) return <EmptyState title="No departments" description="No department data available" />

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Environmental</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Social</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Governance</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall</th>
            </tr>
          </thead>
          <tbody>
            {data.departments.map((dept, i) => (
              <tr key={dept.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'}`} />
                    <span className="text-sm font-medium">{dept.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5"><ScoreBar value={dept.environmental} /></td>
                <td className="px-4 py-3.5"><ScoreBar value={dept.social} /></td>
                <td className="px-4 py-3.5"><ScoreBar value={dept.governance} /></td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                    dept.score >= 75 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' :
                    dept.score >= 50 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' :
                    'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                  }`}>
                    {dept.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
