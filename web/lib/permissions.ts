/**
 * Permission strings returned by GET /v1/me.
 *
 * Each domain has `.view` (read) and `.manage` (create, update, delete).
 * Having `.manage` implies you can use the UI for that resource end-to-end,
 * including listing it (same as view for navigation and tables).
 */
export const PERMISSIONS = {
	warehousesView: "warehouses.view",
	warehousesManage: "warehouses.manage",
	locationsView: "locations.view",
	locationsManage: "locations.manage",
	productsView: "products.view",
	productsManage: "products.manage",
	rolesView: "roles.view",
	rolesManage: "roles.manage",
} as const;

export type PermissionKey =
	| (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
	| string;

export function hasPermission(
	permissions: readonly string[] | undefined,
	key: PermissionKey,
): boolean {
	return permissions?.includes(key) ?? false;
}

export function hasAnyPermission(
	permissions: readonly string[] | undefined,
	keys: readonly PermissionKey[],
): boolean {
	return keys.some((key) => hasPermission(permissions, key));
}

export function hasAllPermissions(
	permissions: readonly string[] | undefined,
	keys: readonly PermissionKey[],
): boolean {
	return keys.every((key) => hasPermission(permissions, key));
}

/** List and read warehouses (includes full managers). */
export function canViewWarehouses(
	permissions: readonly string[] | undefined,
): boolean {
	return hasAnyPermission(permissions, [
		PERMISSIONS.warehousesView,
		PERMISSIONS.warehousesManage,
	]);
}

/** Create, update, or delete warehouses. */
export function canManageWarehouses(
	permissions: readonly string[] | undefined,
): boolean {
	return hasPermission(permissions, PERMISSIONS.warehousesManage);
}

export function canViewLocations(
	permissions: readonly string[] | undefined,
): boolean {
	return hasAnyPermission(permissions, [
		PERMISSIONS.locationsView,
		PERMISSIONS.locationsManage,
	]);
}

export function canManageLocations(
	permissions: readonly string[] | undefined,
): boolean {
	return hasPermission(permissions, PERMISSIONS.locationsManage);
}

export function canViewProducts(
	permissions: readonly string[] | undefined,
): boolean {
	return hasAnyPermission(permissions, [
		PERMISSIONS.productsView,
		PERMISSIONS.productsManage,
	]);
}

export function canManageProducts(
	permissions: readonly string[] | undefined,
): boolean {
	return hasPermission(permissions, PERMISSIONS.productsManage);
}

/**
 * Roles admin: inspect roles, permissions catalog, and user assignments.
 * Changing assignments requires {@link canManageRoles}.
 */
export function canViewRoles(
	permissions: readonly string[] | undefined,
): boolean {
	return hasAnyPermission(permissions, [
		PERMISSIONS.rolesView,
		PERMISSIONS.rolesManage,
	]);
}

/** Assign roles to users and other role-admin mutations. */
export function canManageRoles(
	permissions: readonly string[] | undefined,
): boolean {
	return hasPermission(permissions, PERMISSIONS.rolesManage);
}
