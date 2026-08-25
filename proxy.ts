import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const PUBLIC_PATH_PATTERNS = [
  /^\/$/,
  /^\/sign-in($|\/.*)/,
  /^\/sign-up($|\/.*)/,
  /^\/api\/webhooks($|\/.*)/,
  /^\/api\/debug($|\/.*)/,
  /^\/terms($|\/.*)/,
  /^\/privacy($|\/.*)/,
  /^\/\.well-known($|\/.*)/,
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // If the route is not public and user is not authenticated, protect it
  if (!isPublicRoute(pathname) && !userId) {
    await auth.protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/__clerk/:path*',
    '/(api|trpc)(.*)',
  ],
};
