/**
 * Http-visible session marker for Next.js `proxy` (Edge cannot read `localStorage`).
 * Value is not the API token — only “logged in” vs not. The API still validates Bearer tokens.
 */

export const AUTH_SESSION_COOKIE_NAME = "warehouse_session";

/** Marker value stored in the cookie (opaque flag, not the Sanctum token). */
export const AUTH_SESSION_COOKIE_VALUE = "1";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function buildCookieString(parts: string[]): string {
	return parts.join("; ");
}

/** Sets the session cookie (call after successful login / when syncing from storage). */
export function setAuthSessionCookieClient(): void {
	if (typeof document === "undefined") {
		return;
	}
	const useSecure =
		typeof window !== "undefined" && window.location.protocol === "https:";
	const parts = [
		`${AUTH_SESSION_COOKIE_NAME}=${AUTH_SESSION_COOKIE_VALUE}`,
		"Path=/",
		`Max-Age=${MAX_AGE_SECONDS}`,
		"SameSite=Lax",
	];
	if (useSecure) {
		parts.push("Secure");
	}
	// biome-ignore lint/suspicious/noDocumentCookie: marker cookie for `proxy`; Cookie Store API is overkill here.
	document.cookie = buildCookieString(parts);
}

/** Removes the session cookie (call on logout / when storage is cleared). */
export function clearAuthSessionCookieClient(): void {
	if (typeof document === "undefined") {
		return;
	}
	// biome-ignore lint/suspicious/noDocumentCookie: clearing marker cookie on logout.
	document.cookie = buildCookieString([
		`${AUTH_SESSION_COOKIE_NAME}=`,
		"Path=/",
		"Max-Age=0",
		"SameSite=Lax",
	]);
}
