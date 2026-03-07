import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const isAuthPath = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");

  let response;

  if (isAdminPath) {
    if (!isLoggedIn) {
      response = NextResponse.redirect(new URL("/login", request.url));
    } else if (session.user.role !== "admin") {
      response = NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Ha be van jelentkezve, de login/register oldalon van, visszairányítjuk a főoldalra/adminra
  if (!response && isAuthPath && isLoggedIn) {
    if (session.user.role === "admin") {
      response = NextResponse.redirect(new URL("/admin", request.url));
    } else {
      response = NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (!response) {
    response = NextResponse.next();
  }

  // Dinamikus biztonsági fejlécek a böngésző cachelés megakadályozására
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets|logo).*)"],
};
