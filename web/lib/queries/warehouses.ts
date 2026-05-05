import { queryOptions } from "@tanstack/react-query";

import {
	listWarehouses,
	type WarehousesIndexQuery,
} from "@/lib/api/warehouses";

export const warehouseQueryKeys = {
	all: ["warehouses"] as const,
	list: (query: WarehousesIndexQuery) =>
		[...warehouseQueryKeys.all, "list", query] as const,
};

export function warehousesListQueryOptions(query: WarehousesIndexQuery = {}) {
	return queryOptions({
		queryKey: warehouseQueryKeys.list(query),
		queryFn: () => listWarehouses(query),
	});
}
