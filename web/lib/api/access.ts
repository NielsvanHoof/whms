import { createBrowserAuthedClient } from "@/lib/auth";
import type { components, operations } from "@/lib/openapi/schema";

export type AccessRolesResponse =
	operations["roleManagement.roles"]["responses"]["200"]["content"]["application/json"];
export type AccessPermissionsResponse =
	operations["roleManagement.permissions"]["responses"]["200"]["content"]["application/json"];
export type AccessUsersResponse =
	operations["roleManagement.users"]["responses"]["200"]["content"]["application/json"];

export type SyncUserRolesRequestBody =
	components["schemas"]["SyncUserRolesData"];
export type SyncUserRolesResponse =
	operations["roleManagement.syncUserRoles"]["responses"]["200"]["content"]["application/json"];

export async function listAccessRoles(): Promise<AccessRolesResponse> {
	return createBrowserAuthedClient()
		.get("api/v1/access/roles")
		.json<AccessRolesResponse>();
}

export async function listAccessPermissions(): Promise<AccessPermissionsResponse> {
	return createBrowserAuthedClient()
		.get("api/v1/access/permissions")
		.json<AccessPermissionsResponse>();
}

export async function listAccessUsers(): Promise<AccessUsersResponse> {
	return createBrowserAuthedClient()
		.get("api/v1/access/users")
		.json<AccessUsersResponse>();
}

export async function syncUserRoles(
	userId: number,
	body: SyncUserRolesRequestBody,
): Promise<SyncUserRolesResponse> {
	return createBrowserAuthedClient()
		.put(`api/v1/access/users/${userId}/roles`, { json: body })
		.json<SyncUserRolesResponse>();
}
