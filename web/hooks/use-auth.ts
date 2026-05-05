"use client";

import { useCallback, useEffect, useState } from "react";

import {
	AUTH_SESSION_STORAGE_KEY,
	type AuthSnapshot,
	logout as clearAuthSession,
	getAuthSnapshot,
} from "@/lib/auth";

export type UseAuthResult =
	| {
			status: "loading";
			session: null;
			user: null;
			token: null;
			isAuthenticated: false;
			isGuest: false;
			logout: () => void;
	  }
	| {
			status: "guest";
			session: null;
			user: null;
			token: null;
			isAuthenticated: false;
			isGuest: true;
			logout: () => void;
	  }
	| {
			status: "authenticated";
			session: Extract<AuthSnapshot, { status: "authenticated" }>["session"];
			user: Extract<
				AuthSnapshot,
				{ status: "authenticated" }
			>["session"]["user"];
			token: string;
			isAuthenticated: true;
			isGuest: false;
			logout: () => void;
	  };

/**
 * Hydration-safe auth state for client components.
 * It starts as `loading` so server render and first client render match, then reads localStorage.
 */
export function useAuth(): UseAuthResult {
	const [snapshot, setSnapshot] = useState<AuthSnapshot | null>(null);

	const refresh = useCallback(() => {
		setSnapshot(getAuthSnapshot());
	}, []);

	const logout = useCallback(() => {
		clearAuthSession();
		setSnapshot({ status: "guest" });
	}, []);

	useEffect(() => {
		refresh();

		function onStorage(event: StorageEvent) {
			if (event.key === null || event.key === AUTH_SESSION_STORAGE_KEY) {
				refresh();
			}
		}

		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, [refresh]);

	if (snapshot === null) {
		return {
			status: "loading",
			session: null,
			user: null,
			token: null,
			isAuthenticated: false,
			isGuest: false,
			logout,
		};
	}

	if (snapshot.status === "guest") {
		return {
			status: "guest",
			session: null,
			user: null,
			token: null,
			isAuthenticated: false,
			isGuest: true,
			logout,
		};
	}

	return {
		status: "authenticated",
		session: snapshot.session,
		user: snapshot.session.user,
		token: snapshot.session.token,
		isAuthenticated: true,
		isGuest: false,
		logout,
	};
}
