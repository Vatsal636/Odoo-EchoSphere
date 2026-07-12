'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Leaf,
  Users,
  Shield,
  Gamepad2,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/environmental', label: 'Environmental', icon: Leaf },
  { href: '/dashboard/social', label: 'Social', icon: Users },
  { href: '/dashboard/governance', label: 'Governance', icon: Shield },
  { href: '/dashboard/gamification', label: 'Gamification', icon: Gamepad2 },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href + '/') || pathname === href
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={cn('flex items-center gap-2.5', collapsed && 'justify-center w-full')}>
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-sm" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
              <Leaf className="h-4 w-4 text-white" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <span className="text-base font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">EcoSphere</span>
              <p className="text-[10px] text-muted-foreground leading-tight">ESG Platform</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', active && 'text-primary')} />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-3 space-y-2">
        {!collapsed && session?.user && (
          <div className="px-3 py-2 rounded-xl bg-muted/50">
            <p className="text-xs font-medium text-foreground truncate">{session.user.name}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{session.user.role?.toLowerCase()}</p>
          </div>
        )}
        <div className="flex gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn('flex items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all', collapsed ? 'w-full' : 'flex-1')}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform duration-200', collapsed && 'rotate-180')} />
          </button>
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all flex-1"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 flex lg:hidden items-center justify-center rounded-xl bg-background border shadow-sm p-2.5 text-muted-foreground hover:text-foreground"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-sidebar dark:bg-sidebar transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-sidebar dark:bg-sidebar border-r shadow-2xl flex flex-col overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
