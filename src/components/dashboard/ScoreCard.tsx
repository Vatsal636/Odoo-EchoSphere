import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface ScoreCardProps {
  title: string
  score: number
  icon: LucideIcon
  color: string
  subtitle?: string
}

export function ScoreCard({ title, score, icon: Icon, color, subtitle }: ScoreCardProps) {
  const barColor = score >= 75 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626'

  return (
    <div className="group rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center justify-center rounded-xl p-2.5 bg-gradient-to-br shadow-sm', color)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: barColor }}>{score}</p>
          </div>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
          {score >= 75 ? 'Good' : score >= 50 ? 'Average' : 'Needs attention'}
        </span>
      </div>
      <div className="mt-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(score, 100)}%`, backgroundColor: barColor }}
        />
      </div>
      {subtitle && <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
