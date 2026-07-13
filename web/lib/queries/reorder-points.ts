import { queryOptions } from "@tanstack/react-query";

import type { ListPaginationQuery } from "@/lib/api/list-query-params";
import {
	type LowStockIndexQuery,
	listLowStock,
	listReorderPoints,
	type ReorderPointsIndexQuery,
	showReorderPoint,
} from "@/lib/api/reorder-points";

export const reorderPointQueryKeys = {
	all: ["reorder-points"] as const,
	list: (query: ReorderPointsIndexQuery & ListPaginationQuery) =>
		[...reorderPointQueryKeys.all, "list", query] as const,
	detail: (reorderPointId: number) =>
		[...reorderPointQueryKeys.all, "detail", reorderPointId] as const,
	lowStock: (query: LowStockIndexQuery & ListPaginationQuery) =>
		[...reorderPointQueryKeys.all, "low-stock", query] as const,
};

export function reorderPointsListQueryOptions(
	query: ReorderPointsIndexQuery & ListPaginationQuery = {},
) {
	return queryOptions({
		queryKey: reorderPointQueryKeys.list(query),
		queryFn: () => listReorderPoints(query),
	});
}

export function reorderPointDetailQueryOptions(reorderPointId: number) {
	return queryOptions({
		queryKey: reorderPointQueryKeys.detail(reorderPointId),
		queryFn: () => showReorderPoint(reorderPointId),
	});
}

export function lowStockListQueryOptions(
	query: LowStockIndexQuery & ListPaginationQuery = {},
) {
	return queryOptions({
		queryKey: reorderPointQueryKeys.lowStock(query),
		queryFn: () => listLowStock(query),
	});
}
