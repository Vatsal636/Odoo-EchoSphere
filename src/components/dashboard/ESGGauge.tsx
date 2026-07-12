'use client'
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { useESGScore } from '@/hooks/useESGScore'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'

export function ESGGauge() {
  const { data, isLoading, error } = useESGScore()

  if (isLoading) return <LoadingSkeleton className="h-48 w-48 rounded-full mx-auto" />
  if (error) return <div className="text-destructive text-sm text-center">{error.message}</div>

  const score = data!.overall
  const color = score >= 75 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626'

  return (
    <div className="relative flex items-center justify-center" style={{ height: 220 }}>
      <RadialBarChart
        width={220}
        height={220}
        innerRadius={80}
        outerRadius={105}
        data={[{ value: score, fill: color }]}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="value" cornerRadius={12} background={{ fill: 'var(--muted)' }} isAnimationActive={false} />
      </RadialBarChart>
      <div className="absolute text-center">
        <p className="text-5xl font-bold tracking-tight leading-none" style={{ color }}>{score}</p>
        <p className="text-xs text-muted-foreground mt-1.5">ESG Score</p>
      </div>
    </div>
  )
}
