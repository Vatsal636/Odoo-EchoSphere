'use client'
import { useQuery } from '@tanstack/react-query'
import type { ApiResponse } from '@/types/api.types'
import type { ESGScoreData } from '@/types/domain.types'

export function useESGScore() {
  return useQuery<ESGScoreData>({
    queryKey: ['esg-score'],
    queryFn: async () => {
      const res = await fetch('/api/esg-score')
      const json: ApiResponse<ESGScoreData> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
