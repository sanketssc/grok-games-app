import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Get the IP address from the request
  const forwardedFor = req.headers.get("x-forwarded-for");
  console.log({ forwardedFor });
  const ip = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "";
  console.log({ ip });
  // Return the IP address
  return NextResponse.next();
}

export const config = {
  matcher: "/about/:path*",
};
