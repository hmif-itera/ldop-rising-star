import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/modules/shared';
import type { UserRole } from '@/modules/shared';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Update session & get authenticated user
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // 2. Identify protected route prefixes
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');
  const isGateRoute = pathname.startsWith('/gate');
  const isAdminRoute = pathname.startsWith('/admin');
  const isAudienceRoute = pathname.startsWith('/my-tickets');

  // If visiting login while already logged in, redirect to home or requested path
  if (isAuthRoute && user && !pathname.startsWith('/auth/callback')) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // If accessing protected routes without user, redirect to login
  if ((isGateRoute || isAdminRoute || isAudienceRoute) && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role-based checks for /gate/* and /admin/*
  if (user && supabase && (isGateRoute || isAdminRoute)) {
    // Read role directly from shared_profiles table to ensure instantaneous role updates
    const { data } = await supabase
      .from('shared_profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    const profile = data as { role: UserRole; is_active: boolean } | null;

    if (!profile || !profile.is_active) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'inactive_account');
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute && profile.role !== 'admin') {
      const forbiddenUrl = new URL('/login', request.url);
      forbiddenUrl.searchParams.set('error', 'forbidden_admin_only');
      return NextResponse.redirect(forbiddenUrl);
    }

    if (isGateRoute && !['gate_staff', 'admin'].includes(profile.role)) {
      const forbiddenUrl = new URL('/login', request.url);
      forbiddenUrl.searchParams.set('error', 'forbidden_staff_only');
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
