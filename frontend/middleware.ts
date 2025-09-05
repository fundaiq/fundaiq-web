import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware rules:
 * - If user has logged_in=true cookie and visits "/" or "/auth/*", redirect to "/profile".
 * - If user does NOT have logged_in=true and visits protected routes, redirect to "/auth?next=<path>".
 *
 * Notes:
 * - This does NOT decode JWTs at the edge. It only reads a harmless boolean cookie.
 * - Your API calls keep working as-is; this middleware doesn't run for /api/*.
 */

const PROTECTED_ROUTES = ["/profile", "/portfolios", "/report", "/settings", "/account"];

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const loggedIn = req.cookies.get("logged_in")?.value === "true";

  // 1) If logged in and hitting public pages (home, auth), push to /profile
  const isPublicRoot = pathname === "/";
  const isAuth = pathname.startsWith("/auth");
  if (loggedIn && (isPublicRoot || isAuth)) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  // 2) If NOT logged in and hitting a protected route, redirect to /auth with next=...
  const needsAuth = PROTECTED_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!loggedIn && needsAuth) {
    const url = new URL("/auth", req.url);
    url.searchParams.set("next", `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Limit where middleware runs:
 * - Include all common app pages you want to guard/redirect.
 * - Exclude /api and static assets by not matching them here.
 */
export const config = {
  matcher: [
    "/",                 // homepage
    "/auth/:path*",      // login/register pages
    "/profile/:path*",   // protected
    "/portfolios/:path*",// protected
    "/report/:path*",    // protected
    "/settings/:path*",  // protected
    "/account/:path*",   // protected (alias if you later add /account)
  ],
};
