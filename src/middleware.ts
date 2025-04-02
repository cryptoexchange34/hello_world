import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip middleware for non-browser requests and static files
  if (
    request.headers.get('sec-fetch-dest') === 'image' ||
    request.headers.get('sec-fetch-dest') === 'style' ||
    request.headers.get('sec-fetch-dest') === 'script' ||
    path.startsWith('/_next')
  ) {
    return NextResponse.next();
  }
  
  // Get path segments to determine the current route
  const segments = path.split('/').filter(Boolean);
  
  // Check if user is admin using cookies
  const isAdmin = request.cookies.get('isAdmin')?.value === 'true';
  
  // Special maintenance mode check using cookies
  // In a real app, this would check a database or API
  const isMaintenanceMode = request.cookies.get('maintenanceMode')?.value === 'true';
  
  // Get auth status
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  
  // Admin paths that are always accessible
  const adminPaths = ['/admin', '/admin/settings', '/admin/tokens', '/login'];
  const isAdminPath = segments[0] === 'admin';
  
  // Handle maintenance mode
  if (isMaintenanceMode && !adminPaths.includes(path) && !isAdmin) {
    // Redirect to maintenance page
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
  
  // Admin access restriction
  if (isAdminPath && !isAdmin) {
    if (isLoggedIn) {
      // Redirect to dashboard if logged in but not admin
      return NextResponse.redirect(new URL('/', request.url));
    } else {
      // Redirect to login if not logged in
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure paths that this middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 