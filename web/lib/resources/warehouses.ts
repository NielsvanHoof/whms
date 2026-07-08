import { deleteWarehouse } from "@/lib/api/warehouses";
import {
	canManageWarehouses,
	canViewWarehouses,
	type PermissionKey,
} from "@/lib/permissions";
import {
	warehouseQueryKeys,
	warehousesListQueryOptions,
} from "@/lib/queries/warehouses";

export const warehouseListResource = {
	title: "Warehouses",
	description: "Browse tenant warehouses and filter by name or code.",
	createHref: "/warehouses/create",
	createLabel: "Create warehouse",
	itemLabel: "warehouse",
	loadingTitle: "Fetching warehouses",
	loadingDescription: "Loading warehouses for the current query.",
	errorTitle: "Could not load warehouses",
	errorDescription: "The warehouses list could not be fetched.",
	accessDeniedDescription: "You do not have permission to view warehouses.",
	deleteSuccessMessage: "Warehouse deleted",
	deleteErrorMessage: "Could not delete warehouse.",
	canView: canViewWarehouses,
	canManage: canManageWarehouses,
	deleteFn: deleteWarehouse,
	invalidateQueryKey: warehouseQueryKeys.all,
	listQueryOptions: warehousesListQueryOptions,
} satisfies {
	title: string;
	description: string;
	createHref: string;
	createLabel: string;
	itemLabel: string;
	loadingTitle: string;
	loadingDescription: string;
	errorTitle: string;
	errorDescription: string;
	accessDeniedDescription: string;
	deleteSuccessMessage: string;
	deleteErrorMessage: string;
	canView: (permissions: readonly PermissionKey[] | undefined) => boolean;
	canManage: (permissions: readonly PermissionKey[] | undefined) => boolean;
	deleteFn: (id: number) => Promise<void>;
	invalidateQueryKey: readonly unknown[];
	listQueryOptions: typeof warehousesListQueryOptions;
};
