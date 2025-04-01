import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { auth } from '@/firebase/config';

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/portfolio', '/profile', '/auth'];
const publicRoutes = ['/login', '/signup', '/']
 
export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
 
  // 3. Decrypt the session from the cookie
  const token = (await cookies()).get("token")?.value
 
  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !token) {
    console.log(token);

    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
 
  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    token &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}