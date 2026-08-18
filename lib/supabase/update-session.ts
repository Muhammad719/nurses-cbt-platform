import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  return { url, key }
}

/**
 * Refreshes the Supabase auth session and protects authenticated routes.
 *
 * This function is deliberately defensive: if Vercel is missing the
 * Supabase environment variables, Proxy should not crash the whole site
 * with MIDDLEWARE_INVOCATION_FAILED. The protected page itself will still
 * require a valid Supabase configuration when it attempts to load data.
 */
export async function updateSession(request: NextRequest) {
  const { url, key } = getSupabaseConfig()

  // The administrator login page must remain publicly reachable.
  // Otherwise the /admin/* proxy matcher would redirect /admin/login
  // back to the normal student login before the admin form can render.
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next({ request })
  }

  if (!url || !key) {
    console.error(
      "[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL and/or Supabase public key. " +
        "Set the variables in Vercel Project Settings → Environment Variables.",
    )
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(url, key, {
      cookieOptions: { secure: process.env.NODE_ENV === "production" },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          supabaseResponse = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    })

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.warn("[Supabase] Session check failed:", error.message)
    }

    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = request.nextUrl.pathname.startsWith("/admin")
        ? "/admin/login"
        : "/auth/login"
      loginUrl.searchParams.set("next", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  } catch (error) {
    // Never turn an authentication/session problem into a platform-level
    // MIDDLEWARE_INVOCATION_FAILED response. Let the route handle auth too.
    console.error("[Supabase] Proxy session refresh failed:", error)
    return NextResponse.next({ request })
  }
}
