'use client'
import { useSession, signOut } from 'next-auth/react'
import { Bell, LogOut, Moon, Sun } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const { data: notifData, markAsRead } = useNotifications()
  const { theme, toggle: toggleDark } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'U'

  const unreadCount = notifData?.unreadCount ?? 0

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-xl px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {session?.user?.name ? `Welcome, ${session.user.name.split(' ')[0]}` : 'EcoSphere'}
          </h2>
          <p className="text-xs text-muted-foreground">Enterprise ESG Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-popover shadow-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <span className="text-sm font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAsRead.mutate(undefined)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifData?.notifications.length === 0 ? (
                    <p className="p-6 text-sm text-muted-foreground text-center">No notifications</p>
                  ) : (
                    notifData?.notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => !n.isRead && markAsRead.mutate(n.id)}
                        className={cn(
                          'w-full px-4 py-3 text-left text-sm transition-colors border-b last:border-b-0',
                          !n.isRead ? 'bg-accent/50 hover:bg-accent' : 'hover:bg-accent/50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', !n.isRead ? 'bg-primary' : 'bg-transparent')} />
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm', !n.isRead && 'font-medium')}>{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-xl hover:opacity-80 transition-all ml-1">
              <Avatar className="h-8 w-8 ring-2 ring-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{session?.user?.name}</span>
                <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                <span className="text-xs text-muted-foreground mt-0.5 capitalize">
                  {session?.user?.role?.toLowerCase()} · {session?.user?.departmentId ? 'Dept. assigned' : 'No department'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
