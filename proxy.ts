import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ accept both cookie names
  const token =
    req.cookies.get("token")?.value ||
    req.cookies.get("auth_token")?.value;

  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!token && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
