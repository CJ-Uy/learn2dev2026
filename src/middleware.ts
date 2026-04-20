import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/resetpassword") {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/forgotpassword", request.url));
    }
  }

  const sessionCookie = request.cookies.get("better-auth.session_token");

  const isAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup" ||
    request.nextUrl.pathname === "/forgotpassword" ||
    request.nextUrl.pathname === "/resetpassword";

  const isLandingPage = request.nextUrl.pathname === "/";

  if (sessionCookie && (isAuthPage || isLandingPage)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/forgotpassword", "/resetpassword"],
};
