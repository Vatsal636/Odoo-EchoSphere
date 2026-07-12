import { defineConfig } from 'prisma/config'

export default defineConfig({
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://neondb_owner:npg_ipohdmW1IET9@ep-red-math-attf3izw-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  },
})

