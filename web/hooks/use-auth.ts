"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import {
	AUTH_SESSION_CHANGED_EVENT,
	type AuthSnapshot,
	logout as clearAuthSession,
} from "@/lib/auth";
import { meQueryOptions } from "@/lib/queries/me";

export type UseAuthResult =
	| {
			status: "loading";
			session: null;
			user: null;
			isAuthenticated: false;
			isGuest: false;
			logout: () => void;
	  }
	| {
			status: "guest";
			session: null;
			user: null;
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
			isAuthenticated: true;
			isGuest: false;
			logout: () => void;
	  };

/**
 * Hydration-safe auth state for client components, backed by Sanctum's HttpOnly session cookie.
 */
export function useAuth(): UseAuthResult {
	const [snapshot, setSnapshot] = useState<AuthSnapshot | null>(null);
	const meQuery = useQuery(meQueryOptions());

	const logout = useCallback(() => {
		clearAuthSession();
		setSnapshot({ status: "guest" });
	}, []);

	useEffect(() => {
		const nextSnapshot: AuthSnapshot = meQuery.data
			? { status: "authenticated", session: { user: meQuery.data.data.user } }
			: meQuery.isError
				? { status: "guest" }
				: { status: "guest" };
		setSnapshot(meQuery.isPending ? null : nextSnapshot);
	}, [meQuery.data, meQuery.isError, meQuery.isPending]);

	useEffect(() => {
		function onAuthSessionChanged() {
			void meQuery.refetch();
		}

		window.addEventListener(AUTH_SESSION_CHANGED_EVENT, onAuthSessionChanged);
		return () => {
			window.removeEventListener(
				AUTH_SESSION_CHANGED_EVENT,
				onAuthSessionChanged,
			);
		};
	}, [meQuery]);

	if (snapshot === null) {
		return {
			status: "loading",
			session: null,
			user: null,
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
			isAuthenticated: false,
			isGuest: true,
			logout,
		};
	}

	return {
		status: "authenticated",
		session: snapshot.session,
		user: snapshot.session.user,
		isAuthenticated: true,
		isGuest: false,
		logout,
	};
}
