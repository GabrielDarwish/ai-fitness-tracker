/**
 * Next.js Middleware
 * Basic middleware without rate limiting
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // No rate limiting - pass through all requests
  return NextResponse.next();
}

// Configure which routes middleware runs on
export const config = {
  matcher: [
    "/api/auth/:path*",
  ],
};

