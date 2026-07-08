import { queryOptions } from "@tanstack/react-query";

import type { ListPaginationQuery } from "@/lib/api/list-query-params";
import {
	listWarehouses,
	showWarehouse,
	type WarehousesIndexQuery,
} from "@/lib/api/warehouses";

export const warehouseQueryKeys = {
	all: ["warehouses"] as const,
	list: (query: WarehousesIndexQuery & ListPaginationQuery) =>
		[...warehouseQueryKeys.all, "list", query] as const,
	detail: (warehouseId: number) =>
		[...warehouseQueryKeys.all, "detail", warehouseId] as const,
};

export function warehousesListQueryOptions(
	query: WarehousesIndexQuery & ListPaginationQuery = {},
) {
	return queryOptions({
		queryKey: warehouseQueryKeys.list(query),
		queryFn: () => listWarehouses(query),
	});
}

export function warehouseDetailQueryOptions(warehouseId: number) {
	return queryOptions({
		queryKey: warehouseQueryKeys.detail(warehouseId),
		queryFn: () => showWarehouse(warehouseId),
	});
}
