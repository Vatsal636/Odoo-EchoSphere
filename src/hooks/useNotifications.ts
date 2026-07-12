'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Notification } from '@prisma/client'

interface NotificationsData {
  notifications: Notification[]
  unreadCount: number
}

export function useNotifications() {
  const queryClient = useQueryClient()

  const query = useQuery<NotificationsData>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    refetchInterval: 30_000,
  })

  const markAsRead = useMutation({
    mutationFn: async (id?: string) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return { ...query, markAsRead }
}
