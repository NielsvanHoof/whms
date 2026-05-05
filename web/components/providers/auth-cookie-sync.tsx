"use client";

/**
 * On each full load, align the session cookie with `localStorage` so `proxy` sees the same
 * “logged in” state (e.g. after a refresh with a valid stored token but an expired cookie).
 * If the user is already signed in and lands on `/login`, send them to the dashboard.
 */

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { ensureAuthSessionCookieSynced, isAuthenticated } from "@/lib/auth";

export function AuthCookieSync() {
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		ensureAuthSessionCookieSynced();
		if (pathname === "/login" && isAuthenticated()) {
			router.replace("/dashboard");
		}
	}, [pathname, router]);

	return null;
}
