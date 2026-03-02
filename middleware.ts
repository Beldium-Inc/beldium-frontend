import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/assets/images/logo.png", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/favicon.ico"],
};
