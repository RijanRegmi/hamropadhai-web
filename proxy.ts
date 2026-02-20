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
      userRole = userData?.role ?? null;
    } catch (error) {
      console.error("Invalid user_data cookie");
    }
  }

  // Public routes
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/verification-code",
    "/reset-password",
  ];

  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Role routes (match real folder paths)
  const adminRoutes = ["/admin"];
  const teacherRoutes = ["/teacher"];

  const isAdminRoute = adminRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isTeacherRoute = teacherRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Logged-in users should not access auth pages
  if (token && isPublicRoute) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (userRole === "teacher") {
      return NextResponse.redirect(
        // ✅ FIX: was "/teacher/teacher-dashboard" which doesn't exist
        new URL("/teacher/dashboard", req.url)
      );
    }

    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Not logged in → protect routes
  if (!token && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin accessing non-admin pages
  if (token && userRole === "admin" && !isAdminRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Teacher accessing non-teacher pages
  if (token && userRole === "teacher" && !isTeacherRoute && !isPublicRoute) {
    return NextResponse.redirect(
      new URL("/teacher/dashboard", req.url)
    );
  }

  // Non-admin accessing admin routes
  if (token && isAdminRoute && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Non-teacher accessing teacher routes
  if (token && isTeacherRoute && userRole !== "teacher") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};