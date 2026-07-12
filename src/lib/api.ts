import type { ApiResponse, ApiError } from '@/types/api.types'

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })

  const json: ApiResponse<T> = await res.json()

  if (!json.success) {
    throw new ApiClientError(json.error, res.status)
  }

  return json.data
}

export class ApiClientError extends Error {
  constructor(
    public error: ApiError['error'],
    public status: number
  ) {
    super(error.message)
    this.name = 'ApiClientError'
  }
}
