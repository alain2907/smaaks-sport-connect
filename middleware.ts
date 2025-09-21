import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For admin routes, we'll let the client-side component handle the verification
    // since we need Firebase auth context. A more secure approach would be to
    // verify the Firebase token here server-side
    return NextResponse.next();
  }

  // Laissons Firebase gérer l'authentification côté client
  // Le middleware sera activé plus tard si nécessaire pour des vérifications serveur
  return NextResponse.next();
}

export const config = {
  regions: ["cdg1"], // Force région Paris
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};