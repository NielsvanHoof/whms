import { createHttpClient } from "../http";
import type { AuthUser, LoginResponse } from "./auth-api";

export const AUTH_SESSION_CHANGED_EVENT = "warehouse-auth-session-changed";

export type StoredAuthSession = {
	user: AuthUser;
};

export type AuthSnapshot =
	| { status: "guest" }
	| { status: "authenticated"; session: StoredAuthSession };

function dispatchAuthSessionChanged(): void {
	if (typeof window === "undefined") {
		return;
	}

	window.dispatchEvent(new CustomEvent(AUTH_SESSION_CHANGED_EVENT));
}

export function writeStoredAuthSessionFromLogin(_payload: LoginResponse): void {
	dispatchAuthSessionChanged();
}

export function patchStoredAuthUser(_user: AuthUser): void {
	dispatchAuthSessionChanged();
}

export function clearStoredAuthSession(): void {
	dispatchAuthSessionChanged();
}

export function logout(): void {
	clearStoredAuthSession();
}

export function createBrowserAuthedClient() {
	return createHttpClient({
		onUnauthorized: clearStoredAuthSession,
	});
}
