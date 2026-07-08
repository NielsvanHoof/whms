"use client";

import { useQuery } from "@tanstack/react-query";

import {
	hasAllPermissions,
	hasAnyPermission,
	hasPermission,
	type PermissionKey,
} from "@/lib/permissions";
import { meQueryOptions } from "@/lib/queries/me";

export function usePermissions() {
	const meQuery = useQuery(meQueryOptions());

	const permissions = meQuery.data?.data.permissions ?? [];

	return {
		permissions,
		me: meQuery.data?.data,
		isLoading: meQuery.isPending,
		can: (permission: PermissionKey) => hasPermission(permissions, permission),
		canAny: (keys: readonly PermissionKey[]) =>
			hasAnyPermission(permissions, keys),
		canAll: (keys: readonly PermissionKey[]) =>
			hasAllPermissions(permissions, keys),
	};
}
