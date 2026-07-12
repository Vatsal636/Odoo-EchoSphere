import { PageShell } from '@/components/layout/PageShell'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </PageShell>
  )
}
