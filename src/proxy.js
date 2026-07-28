import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";

const PROTECTED = ["/kitchen", "/onboarding", "/profile"];

export default async function proxy(request) {
  const { pathname } = request.nextUrl;
  const guarded = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!guarded && pathname !== "/auth") return NextResponse.next();

  const session = await readSession();

  if (guarded && !session) {
    return NextResponse.redirect(new URL("/auth", request.nextUrl));
  }

  if (pathname === "/auth" && session) {
    return NextResponse.redirect(new URL("/kitchen", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|png|svg|ico)$).*)"],
};
