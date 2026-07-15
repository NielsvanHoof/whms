"use client";

import { useQuery } from "@tanstack/react-query";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { MeResource } from "@/lib/api/me";
import {
	AUTH_SESSION_CHANGED_EVENT,
	type AuthSnapshot,
	logout as clearAuthSession,
	isUnauthorizedError,
} from "@/lib/auth";
import type { AuthUser } from "@/lib/auth/auth-api";
import {
	hasAllPermissions,
	hasAnyPermission,
	hasPermission,
	type PermissionKey,
} from "@/lib/permissions";
import { meQueryOptions } from "@/lib/queries/me";

type AuthStatus = "loading" | "guest" | "session_error" | "authenticated";

type AuthContextValue = {
	status: AuthStatus;
	user: AuthUser | null;
	session: Extract<AuthSnapshot, { status: "authenticated" }>["session"] | null;
	isAuthenticated: boolean;
	isGuest: boolean;
	error: unknown;
	logout: () => void;
	refetch: () => void;
	permissions: readonly string[];
	me: MeResource | undefined;
	isLoading: boolean;
	can: (permission: PermissionKey) => boolean;
	canAny: (keys: readonly PermissionKey[]) => boolean;
	canAll: (keys: readonly PermissionKey[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [snapshot, setSnapshot] = useState<
		AuthSnapshot | { status: "session_error" } | null
	>(null);
	const meQuery = useQuery(meQueryOptions());

	const refetch = useCallback(() => {
		void meQuery.refetch();
	}, [meQuery]);

	const logout = useCallback(() => {
		clearAuthSession();
		setSnapshot({ status: "guest" });
	}, []);

	useEffect(() => {
		if (meQuery.isPending) {
			setSnapshot(null);
			return;
		}

		if (meQuery.data) {
			setSnapshot({
				status: "authenticated",
				session: { user: meQuery.data.data.user },
			});
			return;
		}

		if (meQuery.isError) {
			if (isUnauthorizedError(meQuery.error)) {
				setSnapshot({ status: "guest" });
			} else {
				setSnapshot({ status: "session_error" });
			}
			return;
		}

		setSnapshot({ status: "guest" });
	}, [meQuery.data, meQuery.error, meQuery.isError, meQuery.isPending]);

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

	const permissions = meQuery.data?.data.permissions ?? [];

	const status: AuthStatus =
		snapshot === null
			? "loading"
			: snapshot.status === "session_error"
				? "session_error"
				: snapshot.status;

	const value = useMemo<AuthContextValue>(
		() => ({
			status,
			user: snapshot?.status === "authenticated" ? snapshot.session.user : null,
			session: snapshot?.status === "authenticated" ? snapshot.session : null,
			isAuthenticated: status === "authenticated",
			isGuest: status === "guest",
			error: meQuery.error,
			logout,
			refetch,
			permissions,
			me: meQuery.data?.data,
			isLoading: meQuery.isPending,
			can: (permission: PermissionKey) =>
				hasPermission(permissions, permission),
			canAny: (keys: readonly PermissionKey[]) =>
				hasAnyPermission(permissions, keys),
			canAll: (keys: readonly PermissionKey[]) =>
				hasAllPermissions(permissions, keys),
		}),
		[
			logout,
			meQuery.data?.data,
			meQuery.error,
			meQuery.isPending,
			permissions,
			refetch,
			snapshot,
			status,
		],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within AuthProvider");
	}
	return context;
}
