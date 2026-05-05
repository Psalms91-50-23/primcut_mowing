import { NextRequest, NextResponse } from "next/server";

type Role = "admin" | "owner" | "employee" | "customer";

type RoutePermission = {
  prefix: string;
  allowedRoles: Role[];
};

const routePermissions: RoutePermission[] = [
  { prefix: "/dashboard/admin", allowedRoles: ["admin", "owner"] },
  { prefix: "/admin/terms/new", allowedRoles: ["admin", "owner"] },
  { prefix: "/employee", allowedRoles: ["admin", "owner", "employee"] },
  { prefix: "/dashboard/owner", allowedRoles: ["owner"] },
  { prefix: "/dashboard/employee", allowedRoles: ["employee"] },
  { prefix: "/dashboard/customer", allowedRoles: ["customer"] },
];

function getDefaultDashboardByRole(role: Role | "") {
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

function redirectToAuth(request: NextRequest) {
  const authUrl = new URL("/auth", request.url);
  const redirectTarget = request.nextUrl.pathname + request.nextUrl.search;

  if (
    redirectTarget &&
    redirectTarget.startsWith("/") &&
    !redirectTarget.startsWith("/auth")
  ) {
    authUrl.searchParams.set("redirect", redirectTarget);
  }

  return NextResponse.redirect(authUrl);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const role = (request.cookies.get("role")?.value || "") as Role | "";

  const hasValidAccessToken = !!accessToken && !isTokenExpired(accessToken);

  if (!hasValidAccessToken && !refreshToken) {
    return redirectToAuth(request);
  }

  if (pathname === "/dashboard") {
    if (!role) {
      return redirectToAuth(request);
    }

    return NextResponse.redirect(
      new URL(getDefaultDashboardByRole(role), request.url)
    );
  }

  const matchedRoute = routePermissions.find((route) =>
    pathname.startsWith(route.prefix)
  );

  if (matchedRoute) {
    if (!role) {
      return redirectToAuth(request);
    }

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
    "/admin/terms/:path*",
    "/dashboard/owner/:path*",
    "/dashboard/employee/:path*",
    "/dashboard/customer/:path*",
    "/employee/:path*",
  ],
};