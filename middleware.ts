import { NextResponse, NextRequest } from "next/server";
import { isComplianceHost, isMarketplaceHost } from "@/src/lib/subdomain";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/assets/images/logo.png", req.url));
  }

  const host = req.headers.get("host") ?? "";

  if (isComplianceHost(host) && pathname === "/") {
    return NextResponse.rewrite(new URL("/compliancedashboard", req.url));
  }

  if (isMarketplaceHost(host) && pathname === "/") {
    return NextResponse.rewrite(new URL("/marketplace", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/favicon.ico", "/"],
};
