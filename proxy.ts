import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/login",
    "/register",
    "/dashboard/:path*",
  ],
};