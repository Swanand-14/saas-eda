// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-up(.*)',
  '/sign-in(.*)',
  '/api/webhook/register',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // If no user and not public → redirect to sign-in
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Role-based redirect
  if (userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      const role = user.publicMetadata?.role as string | undefined;
      const url = new URL(req.url);

      // Admin users should be redirected from /dashboard to /admin/dashboard
      if (role === 'admin' && url.pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      
      // Non-admin users trying to access admin routes
      if (role !== 'admin' && url.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      
      // Authenticated users trying to access public routes
      if (isPublicRoute(req) && url.pathname !== '/dashboard') {
        return NextResponse.redirect(new URL(role === "admin"?"/admin/dashboard":"/dashboard",req.url));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};