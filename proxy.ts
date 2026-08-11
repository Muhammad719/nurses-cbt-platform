import { updateSession } from "@/lib/supabase/update-session"
import type { NextRequest } from "next/server"

/**
 * Next.js 16 Proxy entry point.
 *
 * Keep this matcher focused on authenticated areas so a broken/missing
 * Supabase configuration cannot take down public pages such as the landing
 * page and sign-in screen.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/exam/:path*",
    "/admin/:path*",
    "/results/:path*",
  ],
}
