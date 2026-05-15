import { queryOptions } from "@tanstack/react-query";

import {
	type InventoryBalancesIndexQuery,
	type InventoryMovementsIndexQuery,
	listInventoryBalances,
	listInventoryMovements,
	showInventoryBalance,
} from "@/lib/api/inventory";

export const inventoryQueryKeys = {
	all: ["inventory"] as const,
	balancesList: (query: InventoryBalancesIndexQuery) =>
		[...inventoryQueryKeys.all, "balances", "list", query] as const,
	balanceDetail: (id: number) =>
		[...inventoryQueryKeys.all, "balances", "detail", id] as const,
	movementsList: (query: InventoryMovementsIndexQuery) =>
		[...inventoryQueryKeys.all, "movements", "list", query] as const,
};

export function inventoryBalancesListQueryOptions(
	query: InventoryBalancesIndexQuery = {},
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
	query: InventoryMovementsIndexQuery = {},
) {
	return queryOptions({
		queryKey: inventoryQueryKeys.movementsList(query),
		queryFn: () => listInventoryMovements(query),
	});
}
