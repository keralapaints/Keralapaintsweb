import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/server/session";

/**
 * Runs before /admin and /products pages:
 * - product and category addresses have one spelling: any capital letters move to the lowercase address (301);
 * - /admin needs a valid session cookie, else it goes to the login page. Every admin page and save also checks the
 *   user against the database (lib/server/auth requireUser), so this is the first lock, not the only one.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.toLowerCase().startsWith("/products") && /[A-Z]/.test(pathname)) {
    const lower = request.nextUrl.clone();
    lower.pathname = pathname.toLowerCase();
    return NextResponse.redirect(lower, 301);
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  let response = NextResponse.next();
  if (!pathname.startsWith("/admin/login")) {
    const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const login = new URL("/admin/login/", request.url);
      login.searchParams.set("next", `${pathname}${search}`);
      response = NextResponse.redirect(login);
    }
  }
  // The admin is never for search engines.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

// Every page address (any capitalisation of /products), but not Next's own files or anything with a file extension.
export const config = { matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"] };