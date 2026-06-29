import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
	AUTH_SESSION_COOKIE_NAME,
	AUTH_SESSION_COOKIE_VALUE,
} from "./lib/auth";

const LOGIN_PATH = "/login";
const DASHBOARD_PREFIX = "/dashboard";

/** App routes that require an authenticated session cookie. */
const PROTECTED_PREFIXES = [
	"/dashboard",
	"/warehouses",
	"/locations",
	"/products",
	"/inventory",
	"/settings",
	"/admin",
] as const;

function hasSessionCookie(request: NextRequest): boolean {
	return (
		request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value ===
		AUTH_SESSION_COOKIE_VALUE
	);
}

function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
}

/**
 * Route protection: authenticated app routes require the session cookie (kept in
 * sync with `localStorage` on the client). `/login` sends authenticated users to
 * the dashboard.
 */
export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const authed = hasSessionCookie(request);

	if (isProtectedRoute(pathname) && !authed) {
		const url = request.nextUrl.clone();
		url.pathname = LOGIN_PATH;
		url.searchParams.set("next", pathname);
		return NextResponse.redirect(url);
	}

	if (pathname === LOGIN_PATH && authed) {
		return NextResponse.redirect(new URL(DASHBOARD_PREFIX, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/warehouses/:path*",
		"/locations/:path*",
		"/products/:path*",
		"/inventory/:path*",
		"/settings/:path*",
		"/admin/:path*",
		"/login",
	],
};
