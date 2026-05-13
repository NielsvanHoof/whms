import { queryOptions } from "@tanstack/react-query";

import {
	listAccessPermissions,
	listAccessRoles,
	listAccessUsers,
} from "@/lib/api/access";

export const accessQueryKeys = {
	all: ["access"] as const,
	roles: () => [...accessQueryKeys.all, "roles"] as const,
	permissions: () => [...accessQueryKeys.all, "permissions"] as const,
	users: () => [...accessQueryKeys.all, "users"] as const,
};

export function accessRolesQueryOptions() {
	return queryOptions({
		queryKey: accessQueryKeys.roles(),
		queryFn: listAccessRoles,
	});
}

export function accessPermissionsQueryOptions() {
	return queryOptions({
		queryKey: accessQueryKeys.permissions(),
		queryFn: listAccessPermissions,
	});
}

export function accessUsersQueryOptions() {
	return queryOptions({
		queryKey: accessQueryKeys.users(),
		queryFn: listAccessUsers,
	});
}
