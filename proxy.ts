import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname, searchParams } = req.nextUrl;

  // If user is already signed in and visits /sign-in (excluding /sign-in/sso-callback)
  if (userId && pathname.startsWith('/sign-in') && !pathname.startsWith('/sign-in/sso-callback')) {
    const redirectUrlParam = searchParams.get('redirect_url');
    let targetPath = '/sync';
    if (redirectUrlParam && redirectUrlParam.startsWith('/') && !redirectUrlParam.startsWith('//')) {
      targetPath = redirectUrlParam;
    }
    return NextResponse.redirect(new URL(targetPath, req.url));
  }

  // Protect all non-public routes
  if (!isPublicRoute(req) && !userId) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};