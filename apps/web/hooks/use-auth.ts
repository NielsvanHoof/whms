"use client";

import { useAuthContext } from "@/components/providers/auth-provider";
import type { AuthSnapshot } from "@/lib/auth";

export type UseAuthResult =
	| {
			status: "loading";
			session: null;
			user: null;
			isAuthenticated: false;
			isGuest: false;
			logout: () => void;
			refetch: () => void;
	  }
	| {
			status: "guest";
			session: null;
			user: null;
			isAuthenticated: false;
			isGuest: true;
			logout: () => void;
			refetch: () => void;
	  }
	| {
			status: "session_error";
			session: null;
			user: null;
			isAuthenticated: false;
			isGuest: false;
			error: unknown;
			logout: () => void;
			refetch: () => void;
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
			refetch: () => void;
	  };

/**
 * Hydration-safe auth state for client components, backed by Sanctum's HttpOnly session cookie.
 */
export function useAuth(): UseAuthResult {
	const auth = useAuthContext();

	if (auth.status === "loading") {
		return {
			status: "loading",
			session: null,
			user: null,
			isAuthenticated: false,
			isGuest: false,
			logout: auth.logout,
			refetch: auth.refetch,
		};
	}

	if (auth.status === "session_error") {
		return {
			status: "session_error",
			session: null,
			user: null,
			isAuthenticated: false,
			isGuest: false,
			error: auth.error,
			logout: auth.logout,
			refetch: auth.refetch,
		};
	}

	if (auth.status === "guest") {
		return {
			status: "guest",
			session: null,
			user: null,
			isAuthenticated: false,
			isGuest: true,
			logout: auth.logout,
			refetch: auth.refetch,
		};
	}

	return {
		status: "authenticated",
		session: auth.session as Extract<
			AuthSnapshot,
			{ status: "authenticated" }
		>["session"],
		user: auth.user as Extract<
			AuthSnapshot,
			{ status: "authenticated" }
		>["session"]["user"],
		isAuthenticated: true,
		isGuest: false,
		logout: auth.logout,
		refetch: auth.refetch,
	};
}
