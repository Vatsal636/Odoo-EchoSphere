'use client'
import { ESGGauge } from '@/components/dashboard/ESGGauge'
import { ScoreCard } from '@/components/dashboard/ScoreCard'
import { DeptScoreTable } from '@/components/dashboard/DeptScoreTable'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { useESGScore } from '@/hooks/useESGScore'
import { useSession } from 'next-auth/react'
import { Leaf, Users, Shield, ArrowUpRight, Sparkles, TrendingUp, ShieldAlert, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { data } = useESGScore()
  const role = session?.user?.role
  const isAdmin = role === 'ADMIN'
  const isManager = role === 'MANAGER'

  if (status === 'loading') {
    return <LoadingSkeleton className="h-96 w-full" />
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium ${
              isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' :
              isManager ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
              'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300'
            }`}>
              {isAdmin ? <ShieldAlert className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {role?.toLowerCase() ?? 'loading'}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Real-time ESG performance overview</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 shadow-sm">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium">
            Overall ESG: <span className="text-emerald-600 dark:text-emerald-400">{data?.overall ?? '---'}</span>
          </span>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
      </motion.div>

      <motion.div variants={item}>
        <SummaryCards />
      </motion.div>

      <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
        <ScoreCard title="Environmental" score={data?.environmental ?? 0} icon={Leaf} color="from-emerald-600 to-emerald-700" subtitle="Based on emissions vs targets" />
        <ScoreCard title="Social" score={data?.social ?? 0} icon={Users} color="from-blue-600 to-blue-700" subtitle="Participation & acknowledgement rates" />
        <ScoreCard title="Governance" score={data?.governance ?? 0} icon={Shield} color="from-purple-600 to-purple-700" subtitle="Policy compliance & issue resolution" />
      </motion.div>

      <motion.div variants={item} className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">ESG Score Breakdown</h3>
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 p-1.5">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          </div>
          <ESGGauge />
        </div>
        <div className="lg:col-span-3 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Department Scores</h3>
            {(isAdmin || isManager) && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">Admin view</span>
            )}
          </div>
          <DeptScoreTable />
        </div>
      </motion.div>
    </motion.div>
  )
}
