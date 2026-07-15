import { createHttpClient } from "../http";
import type { AuthUser } from "./auth-api";

export const AUTH_SESSION_CHANGED_EVENT = "warehouse-auth-session-changed";

/** In-memory auth view derived from GET /me (not persisted in localStorage). */
export type AuthSessionView = {
	user: AuthUser;
};

export type AuthSnapshot =
	| { status: "guest" }
	| { status: "authenticated"; session: AuthSessionView };

function dispatchAuthSessionChanged(): void {
	if (typeof window === "undefined") {
		return;
	}

	window.dispatchEvent(new CustomEvent(AUTH_SESSION_CHANGED_EVENT));
}

/** Tell React Query to refetch /me after login. */
export function notifyAuthSessionChanged(): void {
	dispatchAuthSessionChanged();
}

/** @deprecated Use notifyAuthSessionChanged */
export const writeStoredAuthSessionFromLogin = notifyAuthSessionChanged;

/** Tell React Query to refetch /me after profile or permission changes. */
export function notifyAuthUserChanged(_user: AuthUser): void {
	dispatchAuthSessionChanged();
}

/** @deprecated Use notifyAuthUserChanged */
export const patchStoredAuthUser = notifyAuthUserChanged;

/** Tell React Query to refetch /me after logout or 401/419. */
export function notifyAuthSessionCleared(): void {
	dispatchAuthSessionChanged();
}

/** @deprecated Use notifyAuthSessionCleared */
export const clearStoredAuthSession = notifyAuthSessionCleared;

/** @deprecated Use AuthSessionView */
export type StoredAuthSession = AuthSessionView;

export function logout(): void {
	notifyAuthSessionCleared();
}

export function createBrowserAuthedClient() {
	return createHttpClient({
		onUnauthorized: notifyAuthSessionCleared,
	});
}
