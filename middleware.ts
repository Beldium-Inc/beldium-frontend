import { NextResponse, NextRequest } from "next/server";

const COMPLIANCE_HOSTS = new Set(["compliance.beldium.com"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/assets/images/logo.png", req.url));
  }

  const host = req.headers.get("host")?.split(":")[0] ?? "";
  if (COMPLIANCE_HOSTS.has(host) && pathname === "/") {
    return NextResponse.rewrite(new URL("/compliancedashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/favicon.ico", "/"],
};
