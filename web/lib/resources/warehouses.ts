import type { ListPaginationQuery } from "@/lib/api/list-query-params";
import type { WarehousesIndexQuery } from "@/lib/api/warehouses";
import { deleteWarehouse } from "@/lib/api/warehouses";
import { canManageWarehouses, canViewWarehouses } from "@/lib/permissions";
import {
	warehouseQueryKeys,
	warehousesListQueryOptions,
} from "@/lib/queries/warehouses";

import type { ListResource } from "./types";

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
} satisfies ListResource<
	WarehousesIndexQuery & ListPaginationQuery,
	typeof warehousesListQueryOptions
>;
