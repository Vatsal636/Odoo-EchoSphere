import { DefaultSession } from 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      departmentId?: string | null
      totalXP?: number
      totalPoints?: number
    } & DefaultSession['user']
  }

  interface User {
    role: Role
    departmentId?: string | null
    totalXP?: number
    totalPoints?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    departmentId?: string | null
  }
}
