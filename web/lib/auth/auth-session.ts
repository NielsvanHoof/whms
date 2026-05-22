import { createHttpClient } from "../http";
import type { AuthUser, LoginResponse } from "./auth-api";
import {
	clearAuthSessionCookieClient,
	setAuthSessionCookieClient,
} from "./auth-cookie";

/**
 * Current key: one JSON object `{ token, user }` so token and profile stay in sync.
 * localStorage is appropriate for Sanctum SPA tokens; treat XSS as out of scope here.
 */
export const AUTH_SESSION_STORAGE_KEY = "warehouse_auth_session";

/** Fired when session JSON is updated in-tab (e.g. profile name change). */
export const AUTH_SESSION_CHANGED_EVENT = "warehouse-auth-session-changed";

/** What we persist after login (matches API + optional legacy token-only row). */
export type StoredAuthSession = {
	token: string;
	/** Present after login with the new format; null if only a legacy token exists. */
	user: AuthUser | null;
};

/**
 * Parses stored JSON. Returns null if missing, invalid, or empty token.
 */
function parseStoredSession(raw: string): StoredAuthSession | null {
	try {
		const value = JSON.parse(raw) as unknown;
		if (!value || typeof value !== "object") {
			return null;
		}
		const o = value as Record<string, unknown>;
		if (typeof o.token !== "string" || o.token.length === 0) {
			return null;
		}
		if (o.user === undefined || o.user === null) {
			return { token: o.token, user: null };
		}
		if (typeof o.user !== "object") {
			return null;
		}
		const u = o.user as Record<string, unknown>;
		if (
			typeof u.id !== "number" ||
			typeof u.tenant_id !== "number" ||
			typeof u.name !== "string" ||
			typeof u.email !== "string"
		) {
			return null;
		}
		return { token: o.token, user: o.user as AuthUser };
	} catch {
		return null;
	}
}

/**
 * Returns the persisted session, or null when logged out / SSR / invalid data.
 */
export function readStoredAuthSession(): StoredAuthSession | null {
	if (typeof window === "undefined") {
		return null;
	}
	const encoded = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
	if (encoded) {
		const parsed = parseStoredSession(encoded);
		if (parsed) {
			return parsed;
		}
	}
	return null;
}

/** Bearer token for API calls, or null if not logged in. */
export function readStoredAuthToken(): string | null {
	return readStoredAuthSession()?.token ?? null;
}

/** Logged-in user from the last login response, or null (e.g. legacy session until next login). */
export function readStoredAuthUser(): AuthUser | null {
	return readStoredAuthSession()?.user ?? null;
}

/**
 * True when a non-empty token exists (client only). On the server this is always false.
 * Use for guest vs protected UI; the API may still return 401 if the token was revoked.
 */
export function isAuthenticated(): boolean {
	const session = readStoredAuthSession();
	return session !== null && session.token.length > 0;
}

/** True when there is no stored token. On the server this is always true. */
export function isGuest(): boolean {
	return !isAuthenticated();
}

/**
 * Discriminated union: check `status` first, then TypeScript narrows the other fields.
 * - `guest` has only `status` (no token in storage).
 * - `authenticated` includes `session` (`token` + optional `user`).
 */
export type AuthSnapshot =
	| { status: "guest" }
	| { status: "authenticated"; session: StoredAuthSession };

/** Single helper if you prefer `switch (snapshot.status)` over two booleans. */
export function getAuthSnapshot(): AuthSnapshot {
	const session = readStoredAuthSession();
	if (!session) {
		return { status: "guest" };
	}
	return {
		status: "authenticated",
		session,
	};
}

/**
 * Persists token + full user from the login API and updates the marker cookie for `proxy`.
 */
export function writeStoredAuthSessionFromLogin(payload: LoginResponse): void {
	if (typeof window === "undefined") {
		return;
	}
	const session: StoredAuthSession = {
		token: payload.token,
		user: payload.user,
	};
	window.localStorage.setItem(
		AUTH_SESSION_STORAGE_KEY,
		JSON.stringify(session),
	);
	// Edge `proxy` cannot read localStorage, so it uses this marker cookie for routing.
	setAuthSessionCookieClient();
}

/**
 * Keeps the session marker cookie aligned with `localStorage` (e.g. after refresh or tab restore).
 * Safe to call once on app mount from a small client provider.
 */
export function ensureAuthSessionCookieSynced(): void {
	if (typeof window === "undefined") {
		return;
	}
	if (isAuthenticated()) {
		setAuthSessionCookieClient();
	} else {
		clearAuthSessionCookieClient();
	}
}

/** Updates the cached user on the stored session (e.g. after profile save). */
export function patchStoredAuthUser(user: AuthUser): void {
	if (typeof window === "undefined") {
		return;
	}
	const session = readStoredAuthSession();
	if (!session) {
		return;
	}
	window.localStorage.setItem(
		AUTH_SESSION_STORAGE_KEY,
		JSON.stringify({ ...session, user }),
	);
	window.dispatchEvent(new CustomEvent(AUTH_SESSION_CHANGED_EVENT));
	setAuthSessionCookieClient();
}

/** Clears session storage and the routing marker cookie. */
export function clearStoredAuthSession(): void {
	if (typeof window === "undefined") {
		return;
	}
	window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
	clearAuthSessionCookieClient();
}

/** Alias for clearing the session — clearer at call sites. */
export function logout(): void {
	clearStoredAuthSession();
}

/**
 * ky instance that adds Authorization: Bearer <token> using readStoredAuthSession().
 * Use this from client components after the user has logged in.
 */
export function createBrowserAuthedClient() {
	return createHttpClient({ getToken: readStoredAuthToken });
}
