import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname === "/") {
    response.headers.set("Link", '</llms.txt>; rel="alternate"; type="text/plain"');
  }

  return response;
}

export const config = {
  matcher: ["/"],
};
