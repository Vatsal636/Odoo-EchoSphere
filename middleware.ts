import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth?.user

  const publicPaths = ['/', '/login', '/register', '/api/auth']
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p))

  if (isPublicPath) {
    if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return
  }

  if (!isLoggedIn) {
    let callbackUrl = pathname
    if (req.nextUrl.search) callbackUrl += req.nextUrl.search
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url)
    )
  }

  return
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
