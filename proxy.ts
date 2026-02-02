import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token =
    req.cookies.get("token")?.value ||
    req.cookies.get("auth_token")?.value;

  const userDataCookie = req.cookies.get("user_data")?.value;
  let userRole: string | null = null;

  if (userDataCookie) {
    try {
      const userData = JSON.parse(userDataCookie);
      userRole = userData.role || null;
    } catch (error) {
      console.error("Error parsing user_data cookie:", error);
    }
  }

  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  const adminRoutes = ["/admin"];
  const isAdminRoute = adminRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (token && isPublicRoute) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin/users", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!token && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && isAdminRoute && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (token && pathname.startsWith("/dashboard") && userRole === "admin") {
    return NextResponse.redirect(new URL("/admin/users", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};