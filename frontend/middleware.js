import { NextResponse } from 'next/server';

// Paths that require authentication
const protectedPaths = ['/admin'];
// Public paths
const publicPaths = ['/auth/login', '/auth/register'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get the token and role from cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('userRole')?.value;

  // If trying to access admin routes
  if (pathname.startsWith('/admin')) {
    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // If not admin, redirect to home
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // If admin and authenticated, allow access
    return NextResponse.next();
  }

  // If trying to access auth pages while logged in
  if (publicPaths.some(path => pathname.startsWith(path)) && token) {
    // If admin, redirect to admin dashboard
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    // If regular user, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/:path*'
  ],
}; 