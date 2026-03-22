import { NextRequest, NextResponse } from "next/server";

const routePermissions = [
  { prefix: "/dashboard/admin", allowedRoles: ["admin", "owner"] },
  { prefix: "/employee", allowedRoles: ["admin", "owner", "employee" ]},
  { prefix: "/dashboard/owner", allowedRoles: ["owner"] },
  { prefix: "/dashboard/employee", allowedRoles: ["employee"] },
  { prefix: "/dashboard/customer", allowedRoles: ["customer"] },
];

function getDefaultDashboardByRole(role: string) {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "owner":
      return "/dashboard/owner";
    case "employee":
      return "/dashboard/employee";
    case "customer":
      return "/dashboard/customer";
    default:
      return "/auth";
  }
}

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf8")
    );

    const now = Math.floor(Date.now() / 1000);
    return !payload?.exp || payload.exp <= now;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const role = request.cookies.get("role")?.value || "";

  const hasValidAccessToken =
    accessToken && !isTokenExpired(accessToken);

  // No session at all
  // if (!hasValidAccessToken && !refreshToken) {
  //   return NextResponse.redirect(new URL("/auth", request.url));
  // }
  if (!hasValidAccessToken && !refreshToken) {
  const authUrl = new URL("/auth", request.url);
  authUrl.searchParams.set(
    "redirect",
    request.nextUrl.pathname + request.nextUrl.search
  );

  return NextResponse.redirect(authUrl);
}

  // Redirect /dashboard → correct role dashboard
  if (pathname === "/dashboard" && role) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardByRole(role), request.url)
    );
  }

  const matchedRoute = routePermissions.find((route) =>
    pathname.startsWith(route.prefix)
  );

  if (matchedRoute) {
    // If role not yet known, let backend/AuthContext resolve it
    if (!role) return NextResponse.next();

    if (!matchedRoute.allowedRoles.includes(role)) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardByRole(role), request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/admin/:path*",
    "/dashboard/owner/:path*",
    "/dashboard/employee/:path*",
    "/dashboard/customer/:path*",
    "/employee/:path*",
  ],
};