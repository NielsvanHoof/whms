import { queryOptions } from "@tanstack/react-query";

import {
	type InventoryBalancesIndexQuery,
	type InventoryMovementsIndexQuery,
	listInventoryBalances,
	listInventoryMovements,
	showInventoryBalance,
	showInventoryMovement,
} from "@/lib/api/inventory";
import type { ListPageQuery } from "@/lib/api/list-query-params";

export const inventoryQueryKeys = {
	all: ["inventory"] as const,
	balancesList: (query: InventoryBalancesIndexQuery & ListPageQuery) =>
		[...inventoryQueryKeys.all, "balances", "list", query] as const,
	balanceDetail: (id: number) =>
		[...inventoryQueryKeys.all, "balances", "detail", id] as const,
	movementsList: (query: InventoryMovementsIndexQuery & ListPageQuery) =>
		[...inventoryQueryKeys.all, "movements", "list", query] as const,
	movementDetail: (id: number) =>
		[...inventoryQueryKeys.all, "movements", "detail", id] as const,
	transferMovements: (correlationId: string) =>
		[
			...inventoryQueryKeys.all,
			"movements",
			"transfer",
			correlationId,
		] as const,
};

export function inventoryBalancesListQueryOptions(
	query: InventoryBalancesIndexQuery & ListPageQuery = {},
) {
	return queryOptions({
		queryKey: inventoryQueryKeys.balancesList(query),
		queryFn: () => listInventoryBalances(query),
	});
}

export function inventoryBalanceDetailQueryOptions(inventoryBalanceId: number) {
	return queryOptions({
		queryKey: inventoryQueryKeys.balanceDetail(inventoryBalanceId),
		queryFn: () => showInventoryBalance(inventoryBalanceId),
	});
}

export function inventoryMovementsListQueryOptions(
	query: InventoryMovementsIndexQuery & ListPageQuery = {},
) {
	return queryOptions({
		queryKey: inventoryQueryKeys.movementsList(query),
		queryFn: () => listInventoryMovements(query),
	});
}

export function inventoryMovementDetailQueryOptions(movementId: number) {
	return queryOptions({
		queryKey: inventoryQueryKeys.movementDetail(movementId),
		queryFn: () => showInventoryMovement(movementId),
	});
}

/** All ledger rows for one transfer correlation id (typically two legs). */
export function transferMovementsQueryOptions(correlationId: string) {
	return queryOptions({
		queryKey: inventoryQueryKeys.transferMovements(correlationId),
		queryFn: () =>
			listInventoryMovements({
				"filter[transfer_correlation_id]": correlationId,
				per_page: 100,
				page: 1,
			}),
		enabled: correlationId.length > 0,
	});
}
