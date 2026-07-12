'use client'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { ToastProvider } from '@/components/ui/toast'

export function PageShell({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden bg-muted/20">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
              <Navbar />
              <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl p-6 lg:p-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ToastProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
