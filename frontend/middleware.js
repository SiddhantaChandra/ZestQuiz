import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Array of public paths that don't require authentication
const publicPaths = ['/auth/login', '/auth/register', '/'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // If trying to access admin routes
  if (pathname.startsWith('/admin')) {
    // Get the token from cookie
    const token = request.cookies.get('token')?.value;

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode the token to get user data
      const decoded = jwtDecode(token);
      
      // Check if user has admin role
      if (decoded.role !== 'ADMIN') {
        // If not admin, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // If token is invalid, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 