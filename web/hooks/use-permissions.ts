"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import {
	hasAllPermissions,
	hasAnyPermission,
	hasPermission,
	type PermissionKey,
} from "@/lib/permissions";
import { meQueryOptions } from "@/lib/queries/me";

export function usePermissions() {
	const auth = useAuth();
	const meQuery = useQuery({
		...meQueryOptions(),
		enabled: auth.status === "authenticated",
	});

	const permissions = meQuery.data?.data.permissions ?? [];

	return {
		permissions,
		me: meQuery.data?.data,
		isLoading:
			auth.status === "loading" ||
			(auth.status === "authenticated" && meQuery.isPending),
		can: (permission: PermissionKey) => hasPermission(permissions, permission),
		canAny: (keys: readonly PermissionKey[]) =>
			hasAnyPermission(permissions, keys),
		canAll: (keys: readonly PermissionKey[]) =>
			hasAllPermissions(permissions, keys),
	};
}
