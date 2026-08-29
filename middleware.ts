import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error('JWT_SECRET is not defined in middleware');
}

const secret = new TextEncoder().encode(secretKey);

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/',
];

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/round-1',
  '/round-2',
  '/round-3',
  '/leaderboard',
  '/results',
  '/workshop',
];

// Routes that require admin role
const ADMIN_ROUTES = [
  '/admin',
];

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname === route)) {
    return NextResponse.next();
  }

  // Allow API routes that start with /api/auth
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      // No session cookie, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const session = await verifyToken(sessionCookie);

    if (!session) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check admin routes
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
      if (session.role !== 'ADMIN') {
        // Not admin, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Session is valid, allow access
    return NextResponse.next();
  }

  // Allow all other routes
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
